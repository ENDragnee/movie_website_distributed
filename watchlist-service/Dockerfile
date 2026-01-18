FROM python:3.11-slim as base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PORT=8000
EXPOSE 8000

CMD ["gunicorn", "watchlist_service.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]