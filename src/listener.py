import sys
import os
import signal
import traceback
import logging
import pickle,copyreg
import web_pdb
from configparser import ConfigParser
from optparse import OptionParser
from os.path import join as opj
from logging.handlers import RotatingFileHandler
from tools import release
from .websocketserver import WebSocketServer

DEFAULT_CONFIG = {'globals':{'host':'localhost','port':8270,'path':None,'ssl':False, 'origins':None, 'timeout':9000, 'max_size':1048576, 'max_queue':32, 'read_limit':65536, 'write_limit':
65536,'keyfile':None,'certfile':None, 'logfile':'log/service-listener.log','debug':False,'service_config_file':'conf/listener-services.conf'}}


_logger = logging.getLogger(__name__)

def  on_connection_open(client):
	_logger.info('client-open: %s' % (client,))

def on_error(exception):
	_logger.error('client-error: %s' % (exception,))

def on_connection_close(client):
	_logger.info('client-close: %s' % (client,))

def on_data_receive(dispatcher,client,data):
	try:
		imsg = pickle.loads(data)
		omsg = dispatcher._dispatch(imsg)
		rmsg = []
		if type(omsg) in (list,tuple):
			rmsg.extend(omsg)
		else:
			rmsg.append(omsg) 
		
		return pickle.dumps(rmsg)		
	except:
		#web_pdb.post_mortem()
		e = traceback.format_exc()
		print('TRACEBACK:\n',e)
		_logger.error(e)
		web_pdb.post_mortem()
		return pickle.dumps(Exception(e))

def pickle_memoryview(c):
	return memoryview, (c.tobytes(),)
	
copyreg.pickle(memoryview, pickle_memoryview)

def stop(signum,stack):
	os._exit(0)

signal.signal(signal.SIGTERM, stop)
signal.signal(signal.SIGINT, stop)
if sys.platform == 'posix' or sys.platform == 'linux':
	signal.signal(signal.SIGQUIT, stop)

PWD = os.getcwd()
CONFIG_FILE = opj(PWD,'conf','service-listener.conf')
LOG_FILE = opj(PWD,'service-listener.log')	

from optparse import OptionParser
parser = OptionParser(version = '1.0', description = _('Listener of global system resource planned'))
parser.add_option('-c','--config',type='string', dest = 'config_file',help ='Config file', default = CONFIG_FILE)
parser.add_option('-l','--log',type='string', dest = 'log_file',help ='Logging file', default = LOG_FILE)
options,arguments=parser.parse_args()
if 'config_file' in options.__dict__:
	if options.__dict__['config_file'] != CONFIG_FILE:
		CONFIG_FILE = options.__dict__['config_file']

if 'log_file' in options.__dict__:
	if options.__dict__['log_file'] != LOG_FILE:
		LOG_FILE = options.__dict__['log_file']


#cf = ConfigParser()
#cf.read(CONFIG_FILE)
#config = configManager(cf,DEFAULT_CONFIG,bkey=['ssl'],ikey=['port','timeout','max_size','max_queue','read_limit','write_limit'])
#if 'log_file' not in options.__dict__:
#	LOG_FILE = config['globals']['logfile']

formatter = logging.Formatter(fmt = "%(levelname)s: - %(asctime)s - %(name)s - %(message)s")
streamhandler = logging.StreamHandler()
rotatingfilehandler = RotatingFileHandler(LOG_FILE, maxBytes = 1024*1024*64, backupCount = 16, encoding = 'UTF-8')
streamhandler.setFormatter(formatter)
rotatingfilehandler.setFormatter(formatter)
_logger.setLevel(logging.INFO)
#_logger.addHandler(streamhandler)
_logger.addHandler(rotatingfilehandler)
gc = DEFAULT_CONGIG['globals']

if gc['certfile'] and not gc['certfile'].startswith('/'):
	gc['certfile'] = opj(os.getcwd(),gc['certfile'])

if gc['keyfile'] and not gc['keyfile'].startswith('/'):
	gc['keyfile'] = opj(os.getcwd(),gc['keyfile'])



#dispatcher = _service_loader(gc['config_file'])


server = WebSocketServer(gc['host'], gc['port'],allow_reuse_address=True, certfile=gc['certfile'], keyfile=gc['keyfile'], on_data_receive = on_data_receive, on_connection_open=on_connection_open,on_error=on_error, on_connection_close=on_connection_close,service_config_file=gc['service_config_file'], preload = False,DEBUG=gc['debug'])
_logger.info('Server starting of host:%s port:%s' % (gc['host'], gc['port']))
