FROM python:3.8
WORKDIR /backend
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
CMD ["gunicorn", "wsgi:app", "-w 2", "-b 0.0.0.0:5000", "-t 30"]