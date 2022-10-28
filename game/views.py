from django.http import HttpResponse

def index(request):
  return HttpResponse("我的网页")

# Create your views here.
