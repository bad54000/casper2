<?php

namespace Demorose\PHPCI\Plugin\Util;

use PHPCI\Helper\Lang;

/**
 * Processes Json format strings into usable test result data.
 */
class ParserJson
{
    /**
     * @var string
     */
    protected $JsonString;
    protected $failures = 0;

    /**
     * Create a new Json parser for a given string.
     * @param string $JsonString The Json format string to be parsed.
     */
    public function __construct($JsonString) {
        $this->JsonString = json_decode(trim(file_get_contents($JsonString)), true);
    }

    /**
     * Parse a given Json format string and return an array of tests and their status.
     */
    public function parse() {
        $rtn = array();
        $testNumber = 0;

        if (empty($this->JsonString))
            return;
        
	    //var_dump($this->JsonString);
            $failures = 0;
            foreach ($this->JsonString['suites'] as $test) {
		if (!isset($test['etat'])) continue;
                if ($test['etat'] == 'FAIL')
		    $failures ++;
                
                //$rtn[] = $item;
                //$testNumber ++;
            }
	    //var_dump($failures);
	    $this->JsonString['etat'] = $failures ? 'FAIL' : 'PASS';
        //return;
    }

    public function hasErrors() {
	$noerror = true;
        foreach ($this->JsonString['suites'] as $test) {
		if (!isset($test['etat'])) continue;
		$noerror = $noerror && $test['etat'] == 'PASS';
        }
	return !$noerror;
    }

    public function getOutput() {
        return $this->JsonString;
    }

    /**
     * Get the total number of failures from the current Json file.
     * @return int
     */
    public function getTotalFailures() {
        return $this->failures;
    }
}

