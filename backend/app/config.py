from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    aes_database_url: str
    aes_environment: str = "production"
    aes_dev_unauthenticated: bool = False
    aes_cors_origins: list[str] = []

    @model_validator(mode="after")
    def check_local_bypass(self) -> "Settings":
        if self.aes_dev_unauthenticated and self.aes_environment != "local":
            raise ValueError("Unauthenticated mode is permitted only in local environment")
        if not self.aes_database_url.startswith("postgresql+asyncpg://"):
            raise ValueError("AES_DATABASE_URL must use postgresql+asyncpg://")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
