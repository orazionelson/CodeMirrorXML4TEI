<?php

set_time_limit(0);
//https://www.codementor.io/sirolad/validating-xml-against-xsd-in-php-6f56rwcds
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class XmlValidator
{
    /**
     * @var string
     */
    protected $feedSchema = __DIR__ . '/teiresources/tei_all.rng';
    //protected $feedSchema = __DIR__ . '/teiresources/tei_all.xsd';
    /**
     * @var int
     */
    public $feedErrors = 0;
    /**
     * Formatted libxml Error details
     *
     * @var array
     */
    public $errorDetails;
    /**
     * Validation Class constructor Instantiating DOMDocument
     *
     * @param \DOMDocument $handler [description]
     */
    public function __construct()
    {
        $this->handler = new \DOMDocument('1.0', 'utf-8');
    }
    /**
     * @param \libXMLError object $error
     *
     * @return string
     */
    private function libxmlDisplayError($error)
    {
		
        $errorString = "Error $error->code in $error->file (Line:{$error->line}):";
        $errorString .= trim($error->message);
        return $errorString;
    }
    /**
     * @return array
     */
    private function libxmlDisplayErrors()
    {
        $errors = libxml_get_errors();
        //var_dump($errors);
        $result  []  = $errors;
        foreach ($errors as $error) {
            //$result[] = $this->libxmlDisplayError($error);
            //$result[] = $this->$error;
        }
        libxml_clear_errors();
        return $result;
    }
    /**
     * Validate Incoming Feeds against Listing Schema
     *
     * @param resource $feeds
     *
     * @return bool
     *
     * @throws \Exception
     */
    public function validateFeeds($feeds)
    {
        if (!class_exists('DOMDocument')) {
            throw new \DOMException("'DOMDocument' class not found!");
            return false;
        }
        
        if (!file_exists($this->feedSchema)) {
            throw new \Exception('Schema is Missing, Please add schema to feedSchema property');
            return false;
        }

        libxml_use_internal_errors(true);
        
        //Load from string
        //$this->handler->loadXML($feeds);
        $this->handler->loadXML($feeds, LIBXML_NOBLANKS);
        //Load from file
        //$this->handler->load($feeds);
                
        if (!$this->handler->relaxNGValidate($this->feedSchema)) {
        //if (!$this->handler->schemaValidate($this->feedSchema)) {
			$this->errorDetails = $this->libxmlDisplayErrors();
			$this->feedErrors   = 1;
        } else {
          //The file is valid
           return true;
        };
    }
    /**
     * Display Error if Resource is not validated
     *
     * @return array
     */
    public function displayErrors()
    {
		//var_dump($this->errorDetails);
        return $this->errorDetails;
    }
}
//var_dump($_REQUEST);
//var_dump($_POST);
$xml=$_REQUEST['xml'];

$validator = new XmlValidator;
$validated = $validator->validateFeeds($xml);
if ($validated) {
	$resp=array("panel"=>"success",'msg'=>'Successflully validated');
  /*echo '<div class="panel panel-success">
			<div class="panel-heading">Validation</div>
			<div class="panel-body"><p class="lead text-center">Successflully validated</p></div>
		</div>';*/
} else {
	
	$resp=array("panel"=>"danger",'msg'=>'Errors in validation','errors'=>$validator->displayErrors());
	/*echo '<div class="panel panel-danger">
	<div class="panel-heading">Validation Fails</div>';
	echo '<div class="panel-body">';
	foreach($validator->displayErrors() as $k=>$v){
		echo '<ul>';
			echo '<li>'.$v.'</li>';
		echo '</ul>';
		}
	echo '</div>';*/
	
  
}

$rsp=json_encode($resp);

echo $rsp;


