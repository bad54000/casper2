<?php

namespace Demorose\PHPCI\Plugin;

use PHPCI\Plugin;
use PHPCI\Builder;
use PHPCI\Model\Build;

// use Demorose\PHPCI\Plugin\Util\XUnitParser;
use Demorose\PHPCI\Plugin\Util\ParserJson;

/**
* CasperJs - Allows CasperJS testing.
* @author       Emmanuel LEVEQUE <eleveque@hipay.com>
*/
class CasperJs implements Plugin
{
    /**
     * @var \PHPCI\Builderff
     */
    protected $phpci;

    /**
     * @var \PHPCI\Model\Build
     */
    protected $build;

    // protected $x_unit_file_path = '/tmp/casperOutput.xml';
    // protected $x_unit_file_path = 'output_adminSfr.json';

    protected $tests_path = 'tests/test.js';    

    protected $args = '';
    protected $profils = array();

    /**
     * Standard Constructor
     */
    public function __construct(Builder $phpci, Build $build, array $options = array())
    {
        $this->phpci = $phpci;
        $this->build = $build;

        $this->buildArgs($options);
    }

    /**
     * Run CasperJS tests.
     * @return bool
     */
public function execute()
    {
        $output = array();

        $this->phpci->logExecOutput(false);

        //$casperJs = $this->phpci->findBinary('casperjs');
        //if (!$casperJs) {
        //    $this->phpci->logFailure(Lang::get('could_not_find', 'casperjs'));
        //    return false;
        //}

        $profil = ''; 
        $curdir = getcwd();
        chdir($this->phpci->buildPath);
        $success = true;
        try {
		$profils_work = array();
		$profils_ok = array();

		$first = true;
		$max = 1;
		$sleep = 10;

		$switch = true;

		$t = microtime(true);
		$max_t = 60*15; // 15 minutes
		$delai = 0;

		while (count($profils_ok) < count($this->profils) && $delai < $max_t) {

		    if (count($profils_work) < 5) {
			$profil = $first ? current($this->profils) : next($this->profils);

			if ($profil !== false) {
				$cmd = "/usr/local/bin/docker-compose -f /data/docker/phpci/data/docker/docker-compose.yml run -d casperjs casperjs test casper/integration.js --domaine=http://web_1/ --savepath=/data-images --profil=$profil";
				echo $cmd;
				$this->phpci->executeCommand($cmd);
				$profils_work[$profil] = 1;
				// a créeé un nouveau test casper donc pas de spleep
				$sleep = 2;
			}
		    }

		    foreach ($profils_work as $p => $v) {
			if (file_exists($this->phpci->buildPath."casperjs_$p.end")) {
				$parser = new ParserJson($this->phpci->buildPath."casperjs_output_$p.json");
				$parser->parse();
				$output[$p] = $parser->getOutput();
				
				$success = $success && !$parser->hasErrors();

				unset($profils_work[$p]);
				$profils_ok[] = $p;
			}
		    }

		    //var_dump('----START------', $this->profils, $profils_ok, $profils_work, '----END----');
		    sleep($sleep);
		    $first = false;
		    $delai = microtime(true) - $t;
		}
		//var_dump($delai);

        	//chdir($curdir);

        } catch (\Exception $ex) {

            $this->phpci->logFailure('json');
            
            throw $ex;
        }
        // $this->build->storeMeta('casperJs-errors', $failures);
        $this->build->storeMeta('casperJs-data', array(
            'result' => $output,
            'download_path' => 'data/'.$this->build->getId()
        ));

        $this->phpci->logExecOutput(true);

	//$success = false;
        return $success;
    }
    /**
     * Build an args string for PHPCS Fixer.
     * @param $options
     */
    public function buildArgs($options) {
        if (!empty($options['tests_path'])) {
            $this->tests_path = $options['tests_path'];
        }

        // if (!empty($options['x_unit_file_path'])) {
        //     // $this->x_unit_file_path = $options['x_unit_file_path'];
        //     $this->x_unit_file_path = $this->phpci->buildPath;
        // }

        if (!empty($options['args'])) {
            // $this->args= $options['args'];
            $this->args = $this->phpci->interpolate($options['args']);
        }

        if (!empty($options['profils'])) {
            $this->profils = $options['profils'];

        }


    }
}
