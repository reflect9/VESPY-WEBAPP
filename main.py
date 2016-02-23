import re, os, logging, random, string, collections, json
import webapp2, jinja2
import datetime
import pprint
import csv, itertools, operator, copy
import webapp2
# from publisher import Publisher

from google.appengine.ext import ndb

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def randID():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
"""
DATA MODEL
"""

class Page(ndb.Model):
    id = ndb.StringProperty()
    title = ndb.StringProperty()
    url = ndb.StringProperty()
    nodes = ndb.JsonProperty()
    template = ndb.TextProperty()
class DataTable(ndb.Model):
    id = ndb.StringProperty()
    title = ndb.StringProperty()
    json = ndb.JsonProperty()
class App(ndb.Model):
    title = ndb.StringProperty()
    pages = ndb.StructuredProperty(Page, repeated=True)
    datatables = ndb.StructuredProperty(DataTable, repeated=True)


class jsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, ndb.Model):
            return dict((p, getattr(obj, p)) for p in obj.to_dict())
        elif isinstance(obj, users.User):
            return obj.email()
        else:
            return json.JSONEncoder.default(self, obj)

"""
REQUEST HANDLERS
"""
class BuilderHandler(webapp2.RequestHandler):
    def get(self):
        app = App.query().fetch(1)[0]
        template_values = {"app":app, "test":"test"}
        print app
        template = JINJA_ENVIRONMENT.get_template('static/html/builder.html')
        html = template.render(template_values)
        self.response.out.write(html)
class RetrieveHandler(webapp2.RequestHandler):
    def get(self):
        intent = self.request.get("intent")
        print intent
        if intent=="load_app":
            app = App.query().fetch(1)[0]
            app_json = json.dumps(app, cls=jsonEncoder)
            self.response.write(app_json)
        elif intent=="load_pages":
            app = App.query().fetch(1)[0]
            pages_json = json.dumps(app.pages, cls=jsonEncoder)
            self.response.write(pages_json)
        elif intent=="save_app":
            # app = App.query().fetch(1)[0]
            app_json = self.request.get("app_json");
            print app_json
        else:
            pass
class SaveHandler(webapp2.RequestHandler):
    def post(self):
        app_json = self.request.get("data")
        app_data = json.loads(app_json)
        app = App.query().filter(ndb.GenericProperty("title") == app_data["title"]).fetch(1)[0]

        for i, page in enumerate(app.pages):
            page.title = app_data["pages"][i]["title"]
            page.url = app_data["pages"][i]["url"]
            page.nodes = json.dumps(app_data["pages"][i]["nodes"])
            page.template = app_data["pages"][i]["template"]["src"]
        app.put()
        # print app_json
        # print "haha"
        # print app


# p3 = Page(title="Add content", url="add", nodes=nodes_json, template=template3, id=randID())


# class PageHandler(webapp2.RequestHandler):
#     # For actual use of web app 
#     # "http://localhost:8080/page?url=<PAGE URL>""
#     # url = self.request.get("url")
#     # app = App.query().fetch(1)[0]
#     # if url not in app.pages[url]:
#     #     self.response.write("URL: "+url+" is not found.")
#     #     return
#     # else:
#     pass


# class EditHandler(webapp2.RequestHandler):
#     def get(self):
#     	template_values = {}
#         template = JINJA_ENVIRONMENT.get_template('static/html/edit.html')
#         html = template.render(template_values)
#         self.response.out.write(html)
class ViewHandler(webapp2.RequestHandler):
    def get(self):
        url = self.request.get("url")
        app = App.query().fetch(1)[0]
        template_values = {"app":app, "url":url}
        template = JINJA_ENVIRONMENT.get_template('static/html/view.html')
        html = template.render(template_values)
        self.response.out.write(html)

class InitHandler(webapp2.RequestHandler):
    def get(self): # Generates initial app data for development
        apps = App.query().fetch(100)
        for app in apps:
            app.key.delete()
        pages = Page.query().fetch(100)
        for p in pages:
            p.key.delete()
        app = App()
        app.title="app1"
        ### DUMMY NODES
        node1 = { "V":[0,1,2], "position":[1,1], "P":{"type":"Trigger",} }
        node2 = { "V":[3], "position":[2,1], "P":{"type":"literal"} }
        node3 = { "V":[0,3,6], "position":[2,2], "P":{"type":"arithmetic"} }
        nodes = [node1,node2,node3]
        nodes_json = json.dumps(nodes)
        ### OTHER NODES
        node_set = [{"I":["_above","_left"],"ID":"xFzrO","P":{"kind":"flow","type":"trigger","icon":"bell","param":{"event_source":"page"},"description":"Trigger the following nodes when [event_source] is loaded, clicked, or changed."},"V":[],"selected":False,"position":[0,1],"type":"trigger","executed":False},{"I":["_above","_left"],"ID":"5SyDG","P":{"kind":"pick","type":"extract_element","icon":"crosshairs","param":{"source":"_current","selector":"> DIV:nth-of-type(2) > INPUT"},"description":"Extract elements at [selector] from [source]."},"V":[],"selected":False,"position":[1,1],"type":"extract_element","executed":True},{"I":["xFzrO"],"ID":"Mk5i7","P":{"kind":"pick","type":"extract_element","icon":"crosshairs","param":{"source":"_current","selector":"> DIV:nth-of-type(2) > BUTTON"},"description":"Extract elements at [selector] from [source]."},"V":[],"selected":False,"position":[2,3],"type":"extract_element","executed":True},{"I":["_above"],"ID":"zvEbx","P":{"kind":"flow","type":"trigger","icon":"bell","param":{"event_source":"input1"},"description":"Trigger the following nodes when [event_source] is loaded, clicked, or changed.","applicable":True},"V":[],"selected":False,"position":[3,3],"executed":False},{"I":["5SyDG","zvEbx"],"ID":"pGS3S","P":{"kind":"transform","type":"literal","icon":"quote-right","param":{"source":"input1"},"description":"Directly set the current node data to [source].","applicable":True},"V":[],"selected":False,"position":[4,3],"executed":True},{"I":["_above","_left"],"ID":"69ciE","P":{"kind":"apply","type":"create_element","icon":"magic","param":{"value":"input1","tag":"span"},"description":"Create [tag] elements using the [value].","applicable":False},"V":[],"selected":False,"position":[6,3],"executed":True},{"I":["_above","_left"],"ID":"N2RsS","P":{"kind":"pick","icon":"list-alt","type":"get_attribute","param":{"source":"input1","key":"value"},"description":"Get [key] of [source]."},"V":[],"selected":False,"position":[5,3],"type":"get_attribute","executed":True},{"I":["_above","_left"],"ID":"DnuVw","P":{"kind":"apply","type":"attach_element","icon":"gavel","param":{"source":"input1","target":"input2","location":"within-back"},"description":"Attach [source] to [target] at [location].","applicable":False},"V":[],"selected":False,"position":[7,3],"executed":True},{"I":["69ciE","_left"],"ID":"P7fUk","P":{"kind":"pick","type":"extract_element","icon":"crosshairs","param":{"source":"_current","selector":"div#message"},"description":"Extract elements at [selector] from [source]."},"V":[],"selected":False,"position":[7,2],"type":"extract_element","executed":True}]
        ### DUMMY HTML TEMPLATES
        template1 = "Hi!<br><button>Press me</button><div id='message'>I am a message.</div><div><input><button>submit</button></div>"
        template2 = "Testing Testing<div id='title'></div>"
        template3 = "Wanna add some contents?<div id='title'></div>"
        ### DUMMY DATA TABLES
        datatable1 = "[{'name':'tak','score':85},{'name':'ben','score':95}]"
        datatable2 = "[{'name':'tak','score':85},{'name':'ben','score':95}]"
        ### COMPOSING PAGES
        p1 = Page(title="Hello Vespy", url="hello", nodes=json.dumps(node_set), template=template1, id=randID())
        p2 = Page(title="Test page", url="test", nodes=nodes_json, template=template2, id=randID())
        p3 = Page(title="Add content", url="add", nodes=nodes_json, template=template3, id=randID())
        app.pages = [p1,p2,p3]
        dt1 = DataTable(title="dt1", json=datatable1, id=randID())
        dt2 = DataTable(title="dt2", json=datatable2, id=randID())
        app.datatables = [dt1, dt2]
        app.put()




app = webapp2.WSGIApplication([
    # ('/page', PageHandler),
	('/builder', BuilderHandler),
    ('/retrieve', RetrieveHandler),
    ('/save', SaveHandler),
	# ('/edit', EditHandler),
	('/view', ViewHandler),
    ('/init', InitHandler),

], debug=True)
