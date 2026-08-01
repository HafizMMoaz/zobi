from unittest.mock import Mock, patch

from tests.example_data.data_generator.string_generator import StringGenerator


@patch("tests.example_data.data_generator.string_generator.choices")
@patch("tests.example_data.data_generator.string_generator.randint")
def test_string_generator(randint_mock: Mock, choices_mock: Mock):
    letters = "abcdets"
    min_len = 3
    max_len = 5
    randomized_string_len = 4
    string_generator = StringGenerator(letters, min_len, max_len)
    randint_mock.return_value = randomized_string_len
    choices_mock.return_value = ["t", "e", "s", "t"]

    assert string_generator.generate() == "test"
    randint_mock.assert_called_once_with(min_len, max_len)
    choices_mock.assert_called_with(letters, k=randomized_string_len)
