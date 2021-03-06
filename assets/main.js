var orgs = [];
$(function() {
    // Initialise the Zendesk JavaScript API client
    // https://developer.zendesk.com/apps/docs/apps-v2
	var client = ZAFClient.init();
	client.invoke('resize', { width: '100%', height: '200px' });
    client.get('ticket.type').then(function(data) {
      	if (data['ticket.type'] === 'problem') {
			client.invoke('show')
        	client.get('ticket.id').then(function(data) {
          		var ticket = data['ticket.id'];
          		getIncidents(ticket)
      		},
      		function(response) {
        		showError(response);
      		});
      	} else {
			
			var source = $("#non-problem-template").html();
			var template = Handlebars.compile(source);
			var html = template();
			$("#content").html(html);
			client.invoke('hide')
		}	
    });
});

function getIncidents(ticket){
  	var client = ZAFClient.init();
  	var fetchSelf = {
		url: '/api/v2/tickets/' + ticket + '/incidents.json',
		type: 'GET',
		dataType: 'json'
  	};
  	client.request(fetchSelf).then(function(data) {
    	data.tickets.forEach(function(ticket){
			var org = new Object();
			if (Number.isInteger(ticket.organization_id)) {
				n = getOrgName(ticket.organization_id).then(function(name){return name}).then(name => {
					org.name = name;
					
				});
			}
			var i = ticket.custom_fields.findIndex( (el) => el.id === 32535468);
			var url = new URL(window.location.href);
			var c = url.searchParams.get("origin");				
			org.url = c;
			org.mrr = ticket.custom_fields[i].value;
      org.id = ticket.organization_id;
      org.ticketID = ticket.id;
			orgs.push(org)
			return name
		});
		return orgs
  	}).finally(function(){
		setTimeout(checkOrgFinished, 1000);
		
  	},function(response) {
    	showError(response);
  	});
}

function getOrgName(id){
  	var client = ZAFClient.init();
  	var fetchSelf = {
    	url: '/api/v2/organizations/' + id + '.json',
    	type: 'GET',
    	dataType: 'json'
  	};
  	var name = client.request(fetchSelf).then(function(data) {
    	return data.organization.name
	});
	return name;
}


function showInfo(data) {
	var total = 0;
  	data.forEach(function(m) {
		t = parseInt(m.mrr);
		if ((m.mrr != null) && (t > 0)){
			total = parseInt(m.mrr)+total;
		}
	  });
	
  	var templatedata = {
    	'data': data,
		'totalmrr': total,
		'totalcustomer': data.length,
  	};
  	var source = $("#requester-template").html();
  	var template = Handlebars.compile(source);
  	var html = template(templatedata);
  	$("#content").html(html);
}

function showError() {
  	var error_data = {
    	'status': response.status,
    	'statusText': response.statusText
  	};
  	var source = $("#error-template").html();
  	var template = Handlebars.compile(source);
  	var html = template(error_data);
  	$("#content").html(html);
}

function checkOrgFinished() {

	if (orgs[0].name != "") {
		showInfo(orgs)
	}
  }
 
