from wtforms.form import Form

from tests.integration_tests.base_tests import ZobiTestCase
from zobi.forms import CommaSeparatedListField, filter_not_empty_values


class TestForm(ZobiTestCase):
    def test_comma_separated_list_field(self):
        field = CommaSeparatedListField().bind(Form(), "foo")
        field.process_formdata([""])
        assert field.data == [""]

        field.process_formdata(["a,comma,separated,list"])
        assert field.data == ["a", "comma", "separated", "list"]

    def test_filter_not_empty_values(self):
        assert filter_not_empty_values(None) is None
        assert filter_not_empty_values([]) is None
        assert filter_not_empty_values([""]) is None
        assert filter_not_empty_values(["hi"]) == ["hi"]
