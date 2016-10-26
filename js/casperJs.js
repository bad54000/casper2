var casperJsPlugin = ActiveBuild.UiPlugin.extend({
    id: 'build-casperJs-errors',
    css: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
    title: 'casperJs', //Lang.get('casperJs'),
    lastData: null,
    displayOnUpdate: false,
    box: true,
    rendered: false,

    register: function() {
        var self = this;
        var query = ActiveBuild.registerQuery('casperJs-data', -1, {key: 'casperJs-data'})

        $(window).on('casperJs-data', function(data) {
            self.onUpdate(data);
        });

        $(window).on('build-updated', function() {
            if (!self.rendered) {
                self.displayOnUpdate = true;
                query();
            }
        });
    },

    render: function() {
        return $('<div class="table-responsive"><table class="table" id="casperJs-data">' +
            '<thead>' +
            '<tr>' +
            '   <th>casperJs</th>' +
            '</tr>' +
            '</thead><tbody></tbody></table></div>');
    },

    onUpdate: function(e) {
        var domaine = "http://localhost:6010/";
        var getRowFail = function(total, soustotal, assert) {
            var bckg = 'line1';
            if (total % 2 == 0) bckg = 'line2';
            
            return  '<div class="bg-danger">\
                        <h4>\
                            <strong>\
                                <i class="fa fa-times error"></i>\
                                 Test N°' + total + ' ' + assert.classname+'::'+assert.func + '\
                            </strong>\
                            <div class="pull-right">\
                                ' + assert.description + '\
                                <a href="#" data-toggle="modal" data-target="#modal'+soustotal+'">\
                                    <i class="fa fa-picture-o"></i>\
                                </a>\
                                <a href="view-source:' + download_path + '/' + cur_context + '/' + cur_context + '_' + assert.classname + '_'+assert.func+'_' + soustotal + '.html" target="_blank">\
                                    <i class="fa fa-code"></i>\
                                </a>\
                                <a href="#">\
                                    <i class="fa fa-download"></i>\
                                </a>\
                            </div>\
                            <div class="modal fade" tabindex="-1" id="modal' + soustotal + '" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">\
                                <div class="modal-dialog modal-lg">\
                                    <div class="modal-content">\
                                        <img src="/'+download_path+'/'+cur_context+'/'+cur_context+'_'+assert.classname+'_'+assert.func+'_' + soustotal + '.png" width="1200px" height="968px" />\
                                        <div class="modal-footer">\
                                            <a href="'+download_path+'/'+cur_context+'/'+cur_context+'_'+assert.classname+'_'+assert.func+'_' + soustotal + '.png" target="_blank" >Taille réelle</a>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </h4>\
                    </div>';
        }
        var getRowPass = function(total, soustotal, assert) {
            var bckg = 'line1';
            if (total % 2 == 0) bckg = 'line2';
            return  '<div>\
                        <strong>\
                            <i class="fa fa-check success"></i>\
                             Test N°' + total + ' ' + assert.classname+'::'+assert.func + '\
                        </strong>\
                        <div class="pull-right">\
                            ' + assert.description + '\
                            <a href="#" data-toggle="modal" data-target="#modal'+soustotal+'">\
                                <i class="fa fa-picture-o"></i>  \
                            </a>\
                            <a href="view-source:' + download_path+'/'+cur_context+'/'+cur_context+'_'+assert.classname+'_'+assert.func+'_'+soustotal+'.html" target="_blank">\
                                <i class="fa fa-code"></i>  \
                            </a>\
                            <a href="#">\
                                <i class="fa fa-download"></i>  \
                            </a>\
                        </div>\
                        <div class="modal fade" tabindex="-1" id="modal'+soustotal+'" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">\
                            <div class="modal-dialog modal-lg">\
                                <div class="modal-content">\
                                    <img src="/'+download_path+'/'+cur_context+'/'+cur_context+'_'+assert.classname+'_'+assert.func+'_'+soustotal+'.png" width="1200px" height="968px" />\
                                    <div class="modal-footer">\
                                        <a href="'+download_path+'/'+cur_context+'/'+cur_context+'_'+assert.classname+'_'+assert.func+'_'+soustotal+'.png" target="_blank">Taille réelle</a>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
        }
        var getRowTitle = function(context) {
            var icon = '<i class="fa fa-check success"></i>';
            if (context.etat == 'FAIL'){
                icon = '<i class="fa fa-times error"></i>';
            }
            return  '<a data-toggle="collapse" href="#context-'+context.context.replace('.js', '')+'" aria-expanded="true" aria-controls="context-'+context.context.replace('.js', '')+'"><div class="context"><h5>'+icon+'    Context : ' +context.context + ' - ' + context.description + ' exécuté en '+context.temps+'ms    <i class="fa fa-chevron-circle-down"></i></h5></div></a>';
        }
        var getRowTest = function(test, index) {
            var icon = '<i class="fa fa-check success"></i>';
            if (test.etat == 'FAIL'){
                icon = '<i class="fa fa-times error"></i>';
            }
            return  '<a data-toggle="collapse" href="#test'+index+'" aria-expanded="true" aria-controls="test'+index+'"><div class="suite"><h6>'+icon+'  ' + test.description + ' exécuté en '+test.temps+'ms  <i class="fa fa-chevron-circle-down"></i></h6></div></a>';
        }

        if (!e.queryData) {
            console.log('queryData empty');
            $('#build-casperJs-errors').hide();
            return;
        }

        this.rendered = true;
        this.lastData = e.queryData;

        var tests = this.lastData[0].meta_value.result;
        var download_path = this.lastData[0].meta_value.download_path;
        
        var cur_context = '';

        var tbody = $('#casperJs-data tbody');
        tbody.empty();
        var location = $('#casperJs-data'); 
        if (tests.length == 0) {
            $('#build-casperJs-errors').hide();
            return;
        }
        var html = '';
        var index = 1;
        var numsuites = 1;

	for (var i in tests) {
	    numsuites = 1;
	    html += '<div>';
	    context = tests[i];
	    cur_context = context.context;
	    html += getRowTitle(context);

	    if(context.etat != 'FAIL'){
		html += '<div class="collapse" id="context-'+context.context.replace('.js', '')+'">';
	    } else {
		html += '<div class="collapse in" id="context-'+context.context.replace('.js', '')+'">';
	    }

	    for (var j in context.suites) {
		test = context.suites[j];
		html += getRowTest(test, index);
		if(test.etat != 'FAIL'){
		    html += '<div class="collapse assert" id="test'+index+'">';
		} else {
		    html += '<div class="collapse in assert" id="test'+index+'">';
		}
		for (var k in test.tests) {
		    assert = test.tests[k];
		    html += (assert.etat == 'PASS')  ? getRowPass(index, numsuites, assert) : getRowFail(index, numsuites, assert);
			console.log(numsuites);
			console.log(assert);
			numsuites++;
		}
		index++;
		html += '</div>';
	    }
	    html += '</div>';
	    html += '</div>';
	}

        var cssStyle = '<style type="text/css">\
            .error{\
                color:red;\
            }\
            .success{\
                color:green;\
            }\
            .collapse {\
                \
            }\
            .assert{\
                margin:0px 50px;\
                margin-top:0;\
                border-left:solid 5px #ddd;\
                border-right:solid 5px #ddd;\
            }\
            .assert h4{\
                padding:3px 10px;\
                margin:0px;\
            }\
            .suite{\
                padding:3px 15px;\
                background: #ddd;\
                margin: 0px 15px;\
            }\
            .context{\
                padding: 0px 10px;\
                background: #ccc;\
            }\
            .line1{\
                background-color:#eee;\
            }\
            .line2{\
                background-color:#fff;\
            }\
        </style>';
        $('head').append(cssStyle);
        location.append($(html));

        $('#build-casperJs-errors').show();
    }
});

ActiveBuild.registerPlugin(new casperJsPlugin());
