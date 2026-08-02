from typing import TYPE_CHECKING

from flask import current_app as app
from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access

from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP
from zobi.views.base import BaseZobiView
from zobi.zobi_typing import FlaskResponse

if TYPE_CHECKING:
    from werkzeug.datastructures import FileStorage


def upload_stream_write(form_file_field: "FileStorage", path: str) -> None:
    chunk_size = app.config["UPLOAD_CHUNK_SIZE"]
    with open(path, "bw") as file_description:
        while True:
            chunk = form_file_field.stream.read(chunk_size)
            if not chunk:
                break
            file_description.write(chunk)


class DatabaseView(BaseZobiView):
    class_permission_name = "Database"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/list/")
    @has_access
    def list(self) -> FlaskResponse:
        return super().render_app_template()
