FROM python:3-alpine AS build
WORKDIR /usr/src/app

# Sandbox
RUN apk update
RUN apk add gcc make musl-dev linux-headers libseccomp-dev libcap-dev
COPY test_server/sandbox ./sandbox
RUN (cd sandbox && make)


FROM python:3-alpine
WORKDIR /usr/src/app
RUN apk update
RUN apk add libseccomp libcap

# Flask
COPY test_server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_RUN_PORT=8000
EXPOSE 8000

COPY --from=build /usr/src/app/sandbox/sandbox /usr/local/bin/sandbox
COPY test_server/main.py ./main.py
COPY test_server/challenges ./challenges
COPY nginx/content/augments.json ./augments.json

CMD ["flask", "--app", "main", "run", "--host=0.0.0.0"]
