import pytest

from zobi.utils.file import get_filename


@pytest.mark.parametrize(
    "model_name,model_id,skip_id,expected_filename",
    [
        ("Energy Sankey", 132, False, "Energy_Sankey_132"),
        ("Energy Sankey", 132, True, "Energy_Sankey"),
        ("folder1/Energy Sankey", 132, True, "folder1_Energy_Sankey"),
        ("D:\\Charts\\Energy Sankey", 132, True, "DChartsEnergy_Sankey"),
        ("🥴🥴🥴", 4751, False, "4751"),
        ("🥴🥴🥴", 4751, True, "4751"),
        ("Energy Sankey 🥴🥴🥴", 4751, False, "Energy_Sankey_4751"),
        ("Energy Sankey 🥴🥴🥴", 4751, True, "Energy_Sankey"),
        ("你好", 475, False, "475"),
        ("你好", 475, True, "475"),
        ("Energy Sankey 你好", 475, False, "Energy_Sankey_475"),
        ("Energy Sankey 你好", 475, True, "Energy_Sankey"),
    ],
)
def test_get_filename(
    model_name: str, model_id: int, skip_id: bool, expected_filename: str
) -> None:
    original_filename = get_filename(model_name, model_id, skip_id)
    assert expected_filename == original_filename
