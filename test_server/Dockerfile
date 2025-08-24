FROM python:3-alpine
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN apk update
RUN apk add bubblewrap
COPY . .
ENV FLASK_RUN_PORT=3000
EXPOSE 3000
CMD ["flask", "--app", "main", "run", "--host=0.0.0.0", "--debug"]
