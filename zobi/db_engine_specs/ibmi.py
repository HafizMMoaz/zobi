from .db2 import Db2EngineSpec


class IBMiEngineSpec(Db2EngineSpec):
    """IBM Db2 for i (AS/400) engine spec.

    Note: Documentation is in Db2EngineSpec's compatible_databases section.
    This spec exists for runtime support of the ibmi driver.
    """

    engine = "ibmi"
    engine_name = "IBM Db2 for i"
    max_column_name_length = 128

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "(DAYS({col}) - DAYS('1970-01-01')) * 86400 + MIDNIGHT_SECONDS({col})"
