from pydantic import BaseModel
from playhouse.kv import KeyValue


def set(key: str, obj: BaseModel, kv: KeyValue) -> None:
    """
    Set a key in the KeyValue store
    """
    kv[key] = obj.model_dump_json(by_alias=True)


def get(key: str, kv: KeyValue, model: type[BaseModel]) -> BaseModel:
    """
    Get a value from the KeyValue store
    """
    return model.model_validate_json(str(kv[key]))


def get_all(kv: KeyValue, model: type[BaseModel]) -> list[BaseModel]:
    """
    Get all values from the KeyValue store
    """
    return [model.model_validate_json(str(val)) for val in kv.values()]
