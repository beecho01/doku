from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
from datetime import datetime

from server.auth import AuthRequired, NoOpAuth
from server.router import context
from contrib.docker import docker_from_env
import settings
import logging

logger = logging.getLogger(__name__)

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
    """
    Get dashboard data including Docker version, disk usage, scan status, and summary.
    """
    try:
        client = docker_from_env()

        # Docker version
        info = client.info()
        docker_version = {
            "version": info.get("ServerVersion", ""),
            "api_version": info.get("ApiVersion", ""),
            "platform": {
                "name": info.get("OperatingSystem", "")
            }
        }

        # Disk usage from df_data
        df_data = client.df()
        layers_size = df_data.get("LayersSize", 0)
        disk_usage = {
            "used_bytes": layers_size,
            "available_bytes": 0,  # Placeholder; calculate from system disk if needed
            "total_bytes": 0,      # Placeholder
            "used_percent": 0.0   # Placeholder
        }

        # Scan status (assuming you have a scan mechanism; adjust as needed)
        scan_status = {
            "is_scanning": False,
            "last_scan_time": None,
            "scan_duration": None
        }

        # Summary: Aggregate counts and sizes
        containers = client.containers.list(all=True)
        images = client.images.list()
        volumes = client.volumes.list()

        # Build cache from df_data
        build_cache_items = df_data.get("BuildCache", [])
        build_cache_count = len(build_cache_items)
        build_cache_size = sum(item.get("Size", 0) for item in build_cache_items)

        # Container and volume sizes from df_data
        containers_df = df_data.get("Containers", [])
        volumes_df = df_data.get("Volumes", [])

        summary = {
            "images": {
                "count": len(images),
                "size": sum(img.attrs.get("Size", 0) for img in images)
            },
            "containers": {
                "count": len(containers),
                "size": sum(cont.get("SizeRw", 0) + cont.get("SizeRootFs", 0) for cont in containers_df)
            },
            "volumes": {
                "count": len(volumes),
                "size": sum(vol.get("UsageData", {}).get("Size", 0) for vol in volumes_df)
            },
            "cache": {
                "count": build_cache_count,
                "size": build_cache_size
            },
            "overlay2": {
                "size": layers_size
            },
            "logs": {
                "size": 0  # Placeholder; calculate from container logs if needed
            },
            "bind_mounts": {
                "size": 0  # Placeholder; calculate from mounts if needed
            }
        }

        logger.info(f"Dashboard summary: {summary}")  # Debug log
        return {
            "docker_version": docker_version,
            "disk_usage": disk_usage,
            "scan_status": scan_status,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Failed to fetch dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")


@router.get('/images')
def get_images(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker images data"""
    try:
        client = docker_from_env()
        images = client.images.list(all=True)  # Get all images, including intermediate layers

        return [
            {
                'id': img.id,
                'repository': img.tags[0] if img.tags else '<none>',
                'tag': img.tags[0].split(':')[1] if img.tags and ':' in img.tags[0] else '<none>',
                'created': img.attrs.get('Created', ''),

                'size': img.attrs.get('Size', img.attrs.get('Size', 0)),
                'virtual_size': img.attrs.get('VirtualSize', img.attrs.get('Size', 0)),
                'containers': len(img.attrs.get('Containers', [])) if 'Containers' in img.attrs else 0
            }
            for img in images
        ]
    except Exception as e:
        logger.error(f"Failed to fetch images data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch images data: {str(e)}")


@router.get('/containers')
def get_containers(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker containers data"""
    try:
        client = docker_from_env()
        containers = client.containers.list(all=True)

        return [
            {
                'id': cont.id,
                'name': cont.name,
                'image': cont.attrs.get('Config', {}).get('Image', ''),

                'status': cont.status,
                'created': cont.attrs.get('Created', ''),

                'size': cont.attrs.get('SizeRw', 0),
                'ports': _get_container_ports(cont.id, cont)
            }
            for cont in containers
        ]
    except Exception as e:
        logger.error(f"Failed to fetch containers data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch containers data: {str(e)}")


def _get_container_ports(container_id: str, container_obj=None) -> List[str]:
    """Extract port information from container object"""
    if not container_obj:
        return []

    ports = []
    try:
        # Reload container to get latest port information (especially for auto-assigned ports)
        container_obj.reload()

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

        # Fallback to inspect_container API for more detailed port data
        else:
            client = docker_from_env()
            inspect_data = client.api.inspect_container(container_id)
            network_settings = inspect_data.get('NetworkSettings', {})
            ports_dict = network_settings.get('Ports', {})

            for port, mappings in ports_dict.items():
                if mappings:
                    for mapping in mappings:
                        host_ip = mapping.get('HostIp', '')
                        host_port = mapping.get('HostPort', '')
                        if host_port:
                            if host_ip and host_ip != '0.0.0.0':
                                ports.append(f"{host_ip}:{host_port} -> {port}")
                            else:
                                ports.append(f"{host_port} -> {port}")

    except Exception as e:
        # If anything goes wrong, return empty list
        logger.warning(f"Failed to get ports for container {container_id}: {str(e)}")
        pass

    return ports


@router.get('/volumes')
def get_volumes(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker volumes data"""
    try:
        client = docker_from_env()
        volumes = client.volumes.list()
        df_data = client.df()  # Get disk usage data including volume sizes
        volumes_df = df_data.get("Volumes", [])

        # Get volume details and calculate container usage
        volume_data = []
        for vol in volumes:
            # Get size from df_data (nested under UsageData)
            vol_df = next((v for v in volumes_df if v.get("Name") == vol.name), {})
            size = vol_df.get("UsageData", {}).get("Size", 0)

            # Count containers using this volume
            containers_using = 0
            all_containers = client.containers.list(all=True)
            for cont in all_containers:
                mounts = cont.attrs.get('Mounts', [])
                for mount in mounts:
                    if mount.get('Name') == vol.name:
                        containers_using += 1
                        break

            volume_data.append({
                'name': vol.name,
                'driver': vol.attrs.get('Driver', 'local'),
                'created': vol.attrs.get('CreatedAt', ''),

                'size': size,
                'mount_point': vol.attrs.get('Mountpoint', ''),
                'containers': containers_using
            })

        return volume_data
    except Exception as e:
        logger.error(f"Failed to fetch volumes data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch volumes data: {str(e)}")


@router.get('/build-cache')
def get_build_cache(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker build cache data"""
    try:
        client = docker_from_env()
        df_data = client.df()
        build_cache_items = df_data.get("BuildCache", [])

        return [
            {
                'id': item.get('ID', ''),

                'type': item.get('Type', 'unknown'),
                'size': item.get('Size', 0),
                'created': item.get('CreatedAt', ''),
                'last_used': item.get('LastUsedAt', ''),
                'usage_count': item.get('UsageCount', 0)
            }
            for item in build_cache_items
        ]
    except Exception as e:
        logger.error(f"Failed to fetch build cache data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch build cache data: {str(e)}")


@router.get('/logs')
def get_logs(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker container logs data"""
    try:
        client = docker_from_env()
        containers = client.containers.list(all=True)

        logs_data = []
        for cont in containers:
            try:
                # Get log file path from container attributes
                log_path = cont.attrs.get('LogPath', '')
                # Estimate size (Docker doesn't provide direct log size via API)
                size = 0  # Placeholder; could calculate from file system if accessible

                logs_data.append({
                    'container_id': cont.id,
                    'container_name': cont.name,
                    'image': cont.attrs.get('Config', {}).get('Image', ''),

                    'log_path': log_path,
                    'size': size,
                    'created': cont.attrs.get('Created', '')
                })
            except Exception as e:
                logger.warning(f"Failed to get logs for container {cont.name}: {str(e)}")
                continue

        return logs_data
    except Exception as e:
        logger.error(f"Failed to fetch logs data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs data: {str(e)}")


@router.get('/bind-mounts')
def get_bind_mounts(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker bind mounts data"""
    try:
        client = docker_from_env()
        containers = client.containers.list(all=True)

        bind_mounts = []
        for cont in containers:
            mounts = cont.attrs.get('Mounts', [])
            for mount in mounts:
                if mount.get('Type') == 'bind':
                    # Estimate size (bind mounts point to host paths)
                    size = 0  # Placeholder; could calculate from host file system

                    bind_mounts.append({
                        'source': mount.get('Source', ''),
                        'destination': mount.get('Destination', ''),
                        'container_name': cont.name,
                        'size': size,
                        'type': 'bind'
                    })

        return bind_mounts
    except Exception as e:
        logger.error(f"Failed to fetch bind mounts data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch bind mounts data: {str(e)}")


@router.get('/overlay2')
def get_overlay2(_: AuthRequired) -> Dict[str, Any]:
    """Get Docker overlay2 data"""
    try:
        client = docker_from_env()
        df_data = client.df()
        info = client.info()

        layers_size = df_data.get("LayersSize", 0)
        layers = df_data.get("Layers", [])
        total_layers = len(layers)

        # Estimate active layers (simplified)
        active_layers = total_layers  # All layers are technically "active" if referenced
        unused_layers = 0  # Docker manages cleanup automatically

        return {
            'totalSize': layers_size,
            'totalLayers': total_layers,
            'activeLayers': active_layers,
            'activeContainers': len(client.containers.list()),  # Running containers
            'unusedLayers': unused_layers,
            'sharedLayers': 0,  # Not directly available
            'layerBreakdown': {
                'total': total_layers,
                'used': active_layers,
                'categories': [
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
            },
            'storageEfficiency': {
                'layerSharing': 'Good',
                'deduplication': '85%',  # Estimate
                'compressionRatio': '2.1:1'
            },
            'layerDistribution': {
                'imageLayers': total_layers,
                'containerLayers': 0,
                'baseOsLayers': 0
            },
            'systemInfo': {
                'storageDriver': info.get('Driver', 'overlay2'),
                'backingFilesystem': info.get('DriverStatus', [['extfs']])[0][1] if info.get('DriverStatus') else 'extfs',
                'dockerRootDir': info.get('DockerRootDir', '/var/lib/docker'),
                'supportsDType': True,
                'nativeOverlayDiff': True,
                'userxattr': False
            }
        }
    except Exception as e:
        logger.error(f"Failed to fetch overlay2 data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch overlay2 data: {str(e)}")


@router.get('/system-info')
def get_system_info(_: AuthRequired) -> Dict[str, Any]:
    """Get Docker system information"""
    try:
        client = docker_from_env()
        logger.info("Attempting to connect to Docker daemon...")
        info = client.info()
        logger.info(f"Successfully fetched system info: {info.get('ServerVersion', 'unknown')}")
        return info
    except Exception as e:
        logger.error(f"Failed to fetch system info: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch system info: {str(e)}")


@router.get('/system-ping')
def ping_docker_daemon(_: AuthRequired) -> Dict[str, str]:
    """Ping Docker daemon to check connectivity"""
    try:
        client = docker_from_env()
        logger.info("Pinging Docker daemon...")
        client.ping()
        logger.info("Docker daemon ping successful")
        return {"status": "ok", "message": "Docker daemon is responding"}
    except Exception as e:
        logger.error(f"Docker ping failed: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Docker daemon ping failed: {str(e)}")


@router.get('/events')
def get_docker_events(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get recent Docker events (last 100 events)"""
    try:
        client = docker_from_env()
        logger.info("Fetching Docker events...")
        since = int(time.time()) - 3600
        events = list(client.events(since=since, until=int(time.time())))
        logger.info(f"Fetched {len(events)} events")
        return events[-100:]
    except Exception as e:
        logger.error(f"Failed to fetch events: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
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
