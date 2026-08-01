from pytest_mock import MockerFixture

from zobi import is_feature_enabled


def dummy_is_feature_enabled(feature_flag_name: str, default: bool = True) -> bool:
    return True if feature_flag_name.startswith("True_") else default


def test_existing_feature_flags(mocker: MockerFixture) -> None:
    """
    Test that ``is_feature_enabled`` reads flags correctly.
    """
    mocker.patch.dict(
        "zobi.extensions.feature_flag_manager._feature_flags",
        {"FOO": True},
        clear=True,
    )
    assert is_feature_enabled("FOO") is True


def test_nonexistent_feature_flags(mocker: MockerFixture) -> None:
    """
    Test that ``is_feature_enabled`` returns ``False`` when flag not set.
    """
    mocker.patch.dict(
        "zobi.extensions.feature_flag_manager._feature_flags", {}, clear=True
    )
    assert is_feature_enabled("FOO") is False


def test_is_feature_enabled(mocker: MockerFixture) -> None:
    """
    Test ``_is_feature_enabled_func``.
    """
    mocker.patch.dict(
        "zobi.extensions.feature_flag_manager._feature_flags",
        {"True_Flag1": False, "True_Flag2": True, "Flag3": False, "Flag4": True},
        clear=True,
    )
    mocker.patch(
        "zobi.extensions.feature_flag_manager._is_feature_enabled_func",
        dummy_is_feature_enabled,
    )

    assert is_feature_enabled("True_Flag1") is True
    assert is_feature_enabled("True_Flag2") is True
    assert is_feature_enabled("Flag3") is False
    assert is_feature_enabled("Flag4") is True
