import subprocess


class BashMock:
    @staticmethod
    def tag_latest_release(tag):
        bash_command = f"./scripts/tag_latest_release.sh {tag} --dry-run"
        result = subprocess.run(  # noqa: S602
            bash_command,
            shell=True,
            capture_output=True,
            text=True,
            env={"TEST_ENV": "true"},
        )
        return result
