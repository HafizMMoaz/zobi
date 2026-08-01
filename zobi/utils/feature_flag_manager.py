from copy import deepcopy

from flask import Flask


class FeatureFlagManager:
    def __init__(self) -> None:
        super().__init__()
        self._get_feature_flags_func = None
        self._is_feature_enabled_func = None
        self._feature_flags: dict[str, bool] = {}

    def init_app(self, app: Flask) -> None:
        self._get_feature_flags_func = app.config["GET_FEATURE_FLAGS_FUNC"]
        self._is_feature_enabled_func = app.config["IS_FEATURE_ENABLED_FUNC"]
        self._feature_flags = app.config["DEFAULT_FEATURE_FLAGS"]
        self._feature_flags.update(app.config["FEATURE_FLAGS"])

    def get_feature_flags(self) -> dict[str, bool]:
        if self._get_feature_flags_func:
            return self._get_feature_flags_func(deepcopy(self._feature_flags))
        if callable(self._is_feature_enabled_func):
            return dict(  # noqa: C417
                map(
                    lambda kv: (kv[0], self._is_feature_enabled_func(kv[0], kv[1])),
                    self._feature_flags.items(),
                )
            )
        return self._feature_flags

    def is_feature_enabled(self, feature: str) -> bool:
        """Utility function for checking whether a feature is turned on"""
        if self._is_feature_enabled_func:
            return (
                self._is_feature_enabled_func(feature, self._feature_flags[feature])
                if feature in self._feature_flags
                else False
            )
        feature_flags = self.get_feature_flags()
        if feature_flags and feature in feature_flags:
            return feature_flags[feature]
        return False
