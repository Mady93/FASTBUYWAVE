# Stage build
FROM docker.io/python:3.12-slim AS build
WORKDIR /app


COPY . .
RUN pip install -r requirements.txt
RUN chmod +x /app/start.sh
ENTRYPOINT ["python", "server.py"]
#ENTRYPOINT ["./start.sh"]
