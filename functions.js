var config = {
	apiBaseUrl: 'https://www.csgo-servers.eu/api',
}

var categories, tags;

$(document).ready(function(){
	updateCategoriesAndTags();
});

function updateCategoriesAndTags() {
	$.ajax({
		url: config.apiBaseUrl + '/categories',
		dataType: 'json',
		success: function(data) {
			categories = data;
			let categoryPicker = $('#categoryPicker');
			for(let i = 0; i < categories.length; i++) {
				let categoryOption = $(document.createElement("option"));
				categoryOption.attr({
					value: categories[i].id
				});
				categoryOption.text(categories[i].name);

				categoryPicker.append(categoryOption);
			}

			$.ajax({
				url: config.apiBaseUrl + '/tags',
				dataType: 'json',
				success: function(data) {
					tags = data;
					let tagSelector = $('#tagSelector');
					for(let i = 0; i < tags.length; i++) {
						let tagButton = $(document.createElement("button"));
						tagButton.attr({
							type: "button",
							name: tags[i].id,
							onClick: "tagSwitch(this)"
						});
						tagButton.text(tags[i].name);
						tagButton.addClass('btn');
						tagButton.addClass('btn-default');

						tagSelector.append(tagButton);
					}

					$('#serversTable').bootstrapTable({
						url: config.apiBaseUrl + '/servers'
					});
				},
				error: function(e) {
					console.log(e.responseText);
				}
			});
		},
		error: function(e) {
			console.log(e.responseText);
		}
    });
}

function refreshServers() {
	$('#serversTable').bootstrapTable('refresh');
}

function apiResponseHandler(res) {

	let tableContent = new Array();
	for(let i = 0; i < res.length; i++) {
		if(res[i].tags)
			res[i].tags = res[i].tags.split(',');
		else
			res[i].tags = new Array();
	}

	return res;
}

function apiQueryParams(params) {
	params = {
		filter: {
			where: {
				and: [{
					categoryId: $('#categoryPicker').val()
				},{
					is_up: true
				}],
				tagIds: {
					inq: [],
					nin: []
				}
			}
		}
	};

	if($('#notfullCheckbox').prop('checked')) {
		params.filter.where.and.push({
			is_full: false
		});
	}
	if($('#notemptyCheckbox').prop('checked')) {
		params.filter.where.and.push({
			players: {
				gt: 0
			}
		});
	}

	$('#tagSelector').children().each(function() {
		if(this.classList.contains('btn-success')) {
			params.filter.where.tagIds.inq.push(this.name);
		}
		else if(this.classList.contains('btn-danger')) {
			params.filter.where.tagIds.nin.push(this.name);
		}
	});

	return params;
}

function ipportFormatter(value, row, index) {
	return '<button class="btn btn-default btn-xs" data-clipboard-text="connect ' + value + '"><span class="fa fa-clipboard"></span></button> <a href="steam://connect/' + value + '">' + value + '</a>';
}

function playersFormatter(value, row, index) {
	return value + '/' + row.players_max;
}

function tagsFormatter(value, row, index) {
	let tagHtml = '';

	for(let i = 0; i < row.tagIds.length; i++) {
		for(let j = 0; j < tags.length; j++) {
			if(row.tagIds[i] == tags[j].id) {
				tagHtml += tags[j].name + ', ';
				break;
			}
		}
	}

	return tagHtml.slice(0, -2);
}

function tagSwitch(btn) {
	if(btn.classList.contains('btn-success')) {
		btn.classList.toggle('btn-success');
		btn.classList.toggle('btn-danger');
	}
	else if(btn.classList.contains('btn-danger')) {
		btn.classList.toggle('btn-danger');
	}
	else {
		btn.classList.toggle('btn-success');
	}

	btn.blur();

	refreshServers();
}