import string

from tests.example_data.data_generator.string_generator import StringGenerator


class StringGeneratorFactory:
    @classmethod
    def make(
        cls, seed_letters: str, min_length: int, max_length: int
    ) -> StringGenerator:
        cls.__validate_arguments(seed_letters, min_length, max_length)
        return StringGenerator(seed_letters, min_length, max_length)

    @classmethod
    def make_lowercase_based(cls, min_length: int, max_length: int) -> StringGenerator:
        return cls.make(string.ascii_lowercase, min_length, max_length)

    @classmethod
    def make_ascii_letters_based(
        cls, min_length: int, max_length: int
    ) -> StringGenerator:
        return cls.make(string.ascii_letters, min_length, max_length)

    @staticmethod
    def __validate_arguments(
        seed_letters: str, min_length: int, max_length: int
    ) -> None:
        assert seed_letters, "seed_letters is empty"
        assert min_length > -1, "min_length is negative"
        assert max_length > min_length, "max_length is not bigger then min_length"
