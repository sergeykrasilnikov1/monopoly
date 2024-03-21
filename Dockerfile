FROM python:3.10-alpine
#FROM python:3.8
ENV PYTHONUNBUFFERED 1

WORKDIR .

COPY . .

COPY nginx.conf /etc/nginx/sites-available/default

EXPOSE 8000


RUN pip install -r requirements.txt
