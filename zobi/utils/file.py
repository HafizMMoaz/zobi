from werkzeug.utils import secure_filename


def get_filename(model_name: str, model_id: int, skip_id: bool = False) -> str:
    slug = secure_filename(model_name)
    filename = slug if skip_id else f"{slug}_{model_id}"
    return filename if slug else str(model_id)
