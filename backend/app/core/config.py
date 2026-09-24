from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProcureX Admin API"
    API_V1_STR: str = "/api/v1"

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "procurex_user"
    POSTGRES_PASSWORD: str = "procurex_password"
    POSTGRES_DB: str = "procurex_db"

    # Security & JWT
    SECRET_KEY: str = "procurex_insecure_development_secret_key_change_in_production_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Initial Admin Seed
    FIRST_SUPERUSER_EMAIL: str = "admin@procurex.com"
    FIRST_SUPERUSER_PASSWORD: str = "Admin@123456"
    FIRST_SUPERUSER_NAME: str = "ProcureX Administrator"

    # Test DB URL override (e.g. for sqlite in tests)
    TEST_DATABASE_URL: Optional[str] = None

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.TEST_DATABASE_URL:
            return self.TEST_DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )

settings = Settings()
