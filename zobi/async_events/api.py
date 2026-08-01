import logging

from flask import request, Response
from flask_appbuilder import expose
from flask_appbuilder.api import safe
from flask_appbuilder.security.decorators import permission_name, protect

from zobi.async_events.async_query_manager import AsyncQueryTokenException
from zobi.extensions import async_query_manager, event_logger
from zobi.views.base_api import BaseZobiApi, statsd_metrics

logger = logging.getLogger(__name__)


class AsyncEventsRestApi(BaseZobiApi):
    resource_name = "async_event"
    allow_browser_login = True

    @expose("/", methods=("GET",))
    @event_logger.log_this
    @protect()
    @safe
    @statsd_metrics
    @permission_name("list")
    def events(self) -> Response:
        """
        Read off of the Redis async events stream, using the user's JWT token and
        optional query params for last event received.
        ---
        get:
          summary: Read off of the Redis events stream
          description: >-
            Reads off of the Redis events stream, using the user's JWT token and
            optional query params for last event received.
          parameters:
          - in: query
            name: last_id
            description: Last ID received by the client
            schema:
                type: string
          responses:
            200:
              description: Async event results
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                        result:
                            type: array
                            items:
                              type: object
                              properties:
                                id:
                                  type: string
                                channel_id:
                                  type: string
                                job_id:
                                  type: string
                                user_id:
                                  type: integer
                                status:
                                  type: string
                                errors:
                                  type: array
                                  items:
                                    type: object
                                result_url:
                                  type: string
            401:
              $ref: '#/components/responses/401'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            async_channel_id = async_query_manager.parse_channel_id_from_request(
                request
            )
            last_event_id = request.args.get("last_id")
            events = async_query_manager.read_events(async_channel_id, last_event_id)

        except AsyncQueryTokenException:
            return self.response_401()

        return self.response(200, result=events)
