from zobi.db_engine_specs.ascend import AscendEngineSpec
from tests.integration_tests.base_tests import ZobiTestCase


class TestAscendDbEngineSpec(ZobiTestCase):
    def test_convert_dttm(self):
        dttm = self.get_dttm()

        assert (
            AscendEngineSpec.convert_dttm("DATE", dttm) == "CAST('2019-01-02' AS DATE)"
        )

        assert (
            AscendEngineSpec.convert_dttm("TIMESTAMP", dttm)
            == "CAST('2019-01-02T03:04:05.678900' AS TIMESTAMP)"
        )
