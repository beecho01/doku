from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
from datetime import datetime

from server.auth import AuthRequired, NoOpAuth
from server.router import context
from contrib.docker import docker_from_env
import settings

if not settings.AUTH_ENABLED:
    AuthRequired = NoOpAuth


router = APIRouter(prefix='/api')


class DashboardResponse(BaseModel):
    docker_version: Dict[str, Any]
    disk_usage: Dict[str, Any]
    scan_status: Dict[str, Any]
    summary: Dict[str, Any]


class ScanStatusResponse(BaseModel):
    is_scanning: bool = False
    last_scan_time: Optional[str] = None
    scan_duration: Optional[int] = None


@router.get('/dashboard')
def get_dashboard_data(_: AuthRequired) -> Dict[str, Any]:
    """Get dashboard data including Docker version, disk usage, and summaries"""
    try:
        ctx = context.dashboard()

        # Extract summary data in the format expected by React frontend
        summary = {
            'images': {
                'count': getattr(ctx.get(settings.IMAGE_KEY), 'num', 0) if ctx.get(settings.IMAGE_KEY) else 0,
                'size': getattr(ctx.get(settings.IMAGE_KEY), 'total_size', 0) if ctx.get(settings.IMAGE_KEY) else 0
            },
            'containers': {
                'count': getattr(ctx.get(settings.CONTAINER_KEY), 'num', 0) if ctx.get(settings.CONTAINER_KEY) else 0,
                'size': getattr(ctx.get(settings.CONTAINER_KEY), 'total_size', 0) if ctx.get(settings.CONTAINER_KEY) else 0
            },
            'volumes': {
                'count': getattr(ctx.get(settings.VOLUME_KEY), 'num', 0) if ctx.get(settings.VOLUME_KEY) else 0,
                'size': getattr(ctx.get(settings.VOLUME_KEY), 'total_size', 0) if ctx.get(settings.VOLUME_KEY) else 0
            },
            'cache': {
                'count': getattr(ctx.get(settings.BUILD_CACHE_KEY), 'num', 0) if ctx.get(settings.BUILD_CACHE_KEY) else 0,
                'size': getattr(ctx.get(settings.BUILD_CACHE_KEY), 'total_size', 0) if ctx.get(settings.BUILD_CACHE_KEY) else 0
            },
            'overlay2': {
                'size': getattr(ctx.get('overlay2'), 'total_size', 0) if ctx.get('overlay2') else 0
            },
            'logs': {
                'size': getattr(ctx.get(settings.TABLE_LOGFILES), 'total_size', 0) if ctx.get(settings.TABLE_LOGFILES) else 0
            },
            'bind_mounts': {
                'size': 0  # This would need to be calculated from DB_DU
            }
        }

        return {
            'docker_version': {
                'version': ctx['version'].version,
                'api_version': ctx['version'].api_version,
                'platform': {
                    'name': ctx['version'].platform_name
                }
            },
            'disk_usage': {
                'used_bytes': ctx['disk_usage'].used,
                'available_bytes': ctx['disk_usage'].free,
                'total_bytes': ctx['disk_usage'].total,
                'used_percent': ctx['disk_usage'].percent
            },
            'scan_status': {
                'is_scanning': False,  # This would need to be tracked in state
                'last_scan_time': None,  # This would come from scan timestamps
                'scan_duration': None
            },
            'summary': summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")


@router.get('/images')
def get_images(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker images data"""
    try:
        ctx = context.images()
        items = ctx.get('items', [])

        if not items:
            return []

        return [
            {
                'id': item.id,
                'repository': item.repo_tags[0] if item.repo_tags else '<none>',
                'tag': item.repo_tags[0].split(':')[1] if item.repo_tags and ':' in item.repo_tags[0] else '<none>',
                'created': item.created.isoformat() if hasattr(item, 'created') else '',
                'size': item.size,
                'virtual_size': item.size,  # Using size as virtual_size since virtual_size doesn't exist in the model
                'containers': len(item.containers) if item.containers else 0
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch images data: {str(e)}")


@router.get('/containers')
def get_containers(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker containers data"""
    try:
        ctx = context.containers()
        items = ctx.get('items', [])

        if not items:
            return []

        # Get additional container details from Docker API
        client = docker_from_env()
        containers_details = {}

        try:
            # Get all containers with port information
            for container in client.containers.list(all=True):
                containers_details[container.id] = container
        except Exception as e:
            # If Docker API is not available, log warning and continue without port info
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not fetch container details from Docker API: {e}")
            pass

        return [
            {
                'id': item.id,
                'name': item.names[0] if item.names else item.id[:12],
                'image': item.image,
                'status': item.state,
                'created': item.created.isoformat() if hasattr(item, 'created') else '',
                'size': getattr(item, 'size_rw', 0),
                'ports': _get_container_ports(item.id, containers_details.get(item.id))
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch containers data: {str(e)}")


def _get_container_ports(container_id: str, container_obj=None) -> List[str]:
    """Extract port information from container object"""
    if not container_obj:
        return []

    ports = []
    try:
        # Try to get ports from container.ports first (docker-py library)
        if hasattr(container_obj, 'ports') and container_obj.ports:
            for port, mappings in container_obj.ports.items():
                if mappings:
                    for mapping in mappings:
                        host_ip = mapping.get('HostIp', '')
                        host_port = mapping.get('HostPort', '')
                        if host_port:
                            if host_ip and host_ip != '0.0.0.0':
                                ports.append(f"{host_ip}:{host_port} -> {port}")
                            else:
                                ports.append(f"{host_port} -> {port}")

        # Fallback to NetworkSettings if container.ports is not available
        elif hasattr(container_obj, 'attrs') and 'NetworkSettings' in container_obj.attrs:
            network_settings = container_obj.attrs['NetworkSettings']
            if 'Ports' in network_settings and network_settings['Ports']:
                for port, mappings in network_settings['Ports'].items():
                    if mappings:
                        for mapping in mappings:
                            host_ip = mapping.get('HostIp', '')
                            host_port = mapping.get('HostPort', '')
                            if host_port:
                                if host_ip and host_ip != '0.0.0.0':
                                    ports.append(f"{host_ip}:{host_port}->{port}")
                                else:
                                    ports.append(f"{host_port}->{port}")
    except Exception as e:
        # If anything goes wrong, return empty list
        pass

    return ports


@router.get('/volumes')
def get_volumes(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker volumes data"""
    try:
        ctx = context.volumes()
        items = ctx.get('items', [])

        if not items:
            return []

        return [
            {
                'name': item.name,
                'driver': item.driver,
                'created': item.created_at.isoformat() if hasattr(item, 'created_at') else '',
                'size': item.size,
                'mount_point': item.mountpoint if hasattr(item, 'mountpoint') else '',
                'containers': 0  # This would need to be calculated
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch volumes data: {str(e)}")


@router.get('/build-cache')
def get_build_cache(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker build cache data"""
    try:
        ctx = context.build_cache()
        items = ctx.get('items', [])

        if not items:
            return []

        return [
            {
                'id': item.id,
                'type': getattr(item, 'type', 'unknown'),
                'size': item.size,
                'created': item.created_at.isoformat() if hasattr(item, 'created_at') else '',
                'last_used': item.last_used.isoformat() if hasattr(item, 'last_used') else '',
                'usage_count': getattr(item, 'usage_count', 0)
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch build cache data: {str(e)}")


@router.get('/logs')
def get_logs(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker container logs data"""
    try:
        ctx = context.logs()
        items = ctx.get('items', [])

        if not items:
            return []

        return [
            {
                'container_id': item.id,
                'container_name': item.name,
                'image': item.image,
                'log_path': item.path,
                'size': item.size,
                'created': item.last_scan.isoformat() if hasattr(item.last_scan, 'isoformat') else str(item.last_scan)
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs data: {str(e)}")


@router.get('/bind-mounts')
def get_bind_mounts(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker bind mounts data"""
    try:
        ctx = context.bind_mounts()
        items = ctx.get('items', [])

        if not items:
            return []

        return [
            {
                'source': item.source,
                'destination': item.destination,
                'container_name': getattr(item, 'container_name', 'unknown'),
                'size': item.size,
                'type': getattr(item, 'type', 'bind')
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bind mounts data: {str(e)}")


@router.get('/overlay2')
def get_overlay2(_: AuthRequired) -> Dict[str, Any]:
    """Get Docker overlay2 data"""
    try:
        ctx = context.overlay2()
        items = ctx.get('items', [])

        if not items:
            return {
                'totalSize': 0,
                'totalLayers': 0,
                'activeLayers': 0,
                'activeContainers': 0,
                'unusedLayers': 0,
                'sharedLayers': 0,
                'layerBreakdown': {
                    'total': 0,
                    'used': 0,
                    'categories': [
                        {
                            'name': 'No Data Available',
                            'size': 0,
                            'color': 'secondary'
                        }
                    ]
                },
                'storageEfficiency': {
                    'layerSharing': 'Not Available',
                    'deduplication': 'N/A',
                    'compressionRatio': 'N/A'
                },
                'layerDistribution': {
                    'imageLayers': 0,
                    'containerLayers': 0,
                    'baseOsLayers': 0
                },
                'systemInfo': {
                    'storageDriver': 'overlay2',
                    'backingFilesystem': 'Unknown',
                    'dockerRootDir': '/var/lib/docker',
                    'supportsDType': True,
                    'nativeOverlayDiff': True,
                    'userxattr': False
                }
            }

        # Calculate statistics from items
        total_size = sum(item.size for item in items)
        total_layers = len(items)
        active_layers = sum(1 for item in items if getattr(item, 'in_use', False))
        unused_layers = total_layers - active_layers

        # Transform items to expected format
        layer_breakdown_categories = [
            {
                'name': 'Active Layers',
                'size': active_layers,
                'color': 'primary'
            },
            {
                'name': 'Unused Layers',
                'size': unused_layers,
                'color': 'secondary'
            }
        ]

        # Calculate deduplication (simplified - in real implementation this would be more complex)
        deduplication_percent = 0
        if total_layers > 0:
            # Estimate deduplication based on layer sharing patterns
            deduplication_percent = min(85, max(0, (total_layers - active_layers) * 100 // total_layers))

        return {
            'totalSize': total_size,
            'totalLayers': total_layers,
            'activeLayers': active_layers,
            'activeContainers': 0,  # This would need to be calculated from container data
            'unusedLayers': unused_layers,
            'sharedLayers': 0,  # This would need more complex analysis
            'layerBreakdown': {
                'total': total_layers,
                'used': active_layers,
                'categories': layer_breakdown_categories
            },
            'storageEfficiency': {
                'layerSharing': 'Good' if deduplication_percent > 50 else 'Fair',
                'deduplication': f'{deduplication_percent}%',
                'compressionRatio': '2.1:1'  # Default estimate
            },
            'layerDistribution': {
                'imageLayers': total_layers,  # Simplified - all layers are image layers
                'containerLayers': 0,
                'baseOsLayers': 0
            },
            'systemInfo': {
                'storageDriver': 'overlay2',
                'backingFilesystem': 'ext4',  # Default assumption
                'dockerRootDir': '/var/lib/docker',
                'supportsDType': True,
                'nativeOverlayDiff': True,
                'userxattr': False
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch overlay2 data: {str(e)}")


@router.get('/system-info')
def get_system_info(_: AuthRequired) -> Dict[str, Any]:
    """Get Docker system information"""
    try:
        client = docker_from_env()
        info = client.system.info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch system info: {str(e)}")


@router.get('/system-ping')
def ping_docker_daemon(_: AuthRequired) -> Dict[str, str]:
    """Ping Docker daemon to check connectivity"""
    try:
        client = docker_from_env()
        client.system.ping()
        return {"status": "ok", "message": "Docker daemon is responding"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docker daemon ping failed: {str(e)}")


@router.get('/system-auth')
def check_docker_auth(_: AuthRequired) -> Dict[str, Any]:
    """Check Docker authentication status"""
    try:
        client = docker_from_env()
        auth_info = client.system.auth()
        return auth_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check auth: {str(e)}")


@router.get('/events')
def get_docker_events(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get recent Docker events (last 100 events)"""
    try:
        client = docker_from_env()
        # Get events from the last hour
        since = int(time.time()) - 3600
        events = list(client.system.events(since=since, until=int(time.time())))
        return events[-100:]  # Return last 100 events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(e)}")


@router.get('/container-logs/{container_id}')
def get_container_logs(container_id: str, _: AuthRequired, lines: int = 100) -> Dict[str, Any]:
    """Get logs for a specific container using Docker API"""
    try:
        client = docker_from_env()
        container = client.containers.get(container_id)

        # Get logs as string
        logs = container.logs(tail=lines, timestamps=True).decode('utf-8')

        return {
            "container_id": container_id,
            "container_name": container.name,
            "logs": logs,
            "lines_requested": lines,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch container logs: {str(e)}")
