# import re, os, logging, random, string, collections, json
# import webapp2, jinja2
# import datetime
# import pprint
# import csv, itertools, operator, copy



# class Publisher:
	
# 	def __init__(self, app_data):
# 		self.app_data = app_data
# 		self.pages = {}

# 	def render(self):
# 		self.pages = {}
# 		for page_data in self.app_data.pages:
# 			self.pages[page_data.url] = self.render_page(page_data)
# 		return self.pages

# 	def render_page(self, page_data):
# 		node_script = self.render_javascript(page_data.nodes)
# 		js_lib = """<script src="js/lib/less.min.js" type="text/javascript"></script>
# 		    <script src="js/lib/jquery-2.0.3.min.js" type="text/javascript"></script>
# 		    <script src="js/lib/underscore-min.js"></script>
# 		    <script src="js/utils.js" type="text/javascript"></script>
# 		    """
# 		js_page = """<script language="javascript" type="text/javascript">%s</script>""" % (node_script)
# 		html = """<html>
# 					<head>%s</head>
# 					<body>%s</body>
# 				</html>""" % (js_lib+js_page, page_data.template)
# 		return html

# 	def render_javascript(self,nodes):
		

# 		return """console.log("haa")"""


