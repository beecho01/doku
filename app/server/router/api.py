from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from server.auth import AuthRequired, NoOpAuth
from server.router import context
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
    last_scan_time: str = None
    scan_duration: int = None


@router.get('/dashboard', response_model=DashboardResponse)
def get_dashboard_data(_: AuthRequired) -> Dict[str, Any]:
    """Get dashboard data including Docker version, disk usage, and summaries"""
    try:
        ctx = context.dashboard()

        # Extract summary data in the format expected by React frontend
        summary = {
            'images': {
                'count': ctx.get(settings.IMAGE_KEY, {}).get('num', 0),
                'size': ctx.get(settings.IMAGE_KEY, {}).get('total_size', 0)
            },
            'containers': {
                'count': ctx.get(settings.CONTAINER_KEY, {}).get('num', 0),
                'size': ctx.get(settings.CONTAINER_KEY, {}).get('total_size', 0)
            },
            'volumes': {
                'count': ctx.get(settings.VOLUME_KEY, {}).get('num', 0),
                'size': ctx.get(settings.VOLUME_KEY, {}).get('total_size', 0)
            },
            'build_cache': {
                'count': ctx.get(settings.BUILD_CACHE_KEY, {}).get('num', 0),
                'size': ctx.get(settings.BUILD_CACHE_KEY, {}).get('total_size', 0)
            },
            'overlay2': {
                'size': ctx.get('overlay2', {}).get('total_size', 0)
            },
            'logs': {
                'size': ctx.get(settings.TABLE_LOGFILES, {}).get('total_size', 0)
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
                    'name': ctx['version'].platform.name
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
                'virtual_size': item.virtual_size,
                'containers': item.containers if hasattr(item, 'containers') else 0
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

        return [
            {
                'id': item.id,
                'name': item.names[0] if item.names else item.id[:12],
                'image': item.image,
                'status': item.status,
                'created': item.created.isoformat() if hasattr(item, 'created') else '',
                'size': getattr(item, 'size_rw', 0),
                'ports': [str(port) for port in getattr(item, 'ports', [])]
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch containers data: {str(e)}")


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
                'container_id': item.container_id,
                'container_name': getattr(item, 'container_name', 'unknown'),
                'log_path': item.path,
                'size': item.size,
                'created': getattr(item, 'created', '')
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
def get_overlay2(_: AuthRequired) -> List[Dict[str, Any]]:
    """Get Docker overlay2 data"""
    try:
        ctx = context.overlay2()
        items = ctx.get('items', [])

        if not items:
            return []

        return [
            {
                'id': getattr(item, 'layer_id', 'unknown'),
                'size': item.size,
                'in_use': getattr(item, 'in_use', False),
                'path': getattr(item, 'path', '')
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch overlay2 data: {str(e)}")


@router.post('/scan')
def trigger_scan(_: AuthRequired) -> Dict[str, str]:
    """Trigger a new scan of Docker resources"""
    try:
        # This would need to be implemented to actually trigger a scan
        # For now, just return a success response
        return {"status": "scan initiated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger scan: {str(e)}")
