FROM python:3.10-slim
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /app/instance && chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
ENV FLASK_APP=app.py
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
