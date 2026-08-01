from zobi.utils.backports import StrEnum


class ChartDataResultFormat(StrEnum):
    """
    Chart data response format
    """

    CSV = "csv"
    JSON = "json"
    XLSX = "xlsx"

    @classmethod
    def table_like(cls) -> set["ChartDataResultFormat"]:
        return {cls.CSV} | {cls.XLSX}


class ChartDataResultType(StrEnum):
    """
    Chart data response type
    """

    COLUMNS = "columns"
    FULL = "full"
    QUERY = "query"
    RESULTS = "results"
    SAMPLES = "samples"
    TIMEGRAINS = "timegrains"
    POST_PROCESSED = "post_processed"
    DRILL_DETAIL = "drill_detail"
