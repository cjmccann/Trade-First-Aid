addEventListener('turbolinks:load', function() {
    $('[data-toggle="table"]').bootstrapTable();
    $('div#favStandings').height($('#favTeamContainer').height());

    if ($('#syncManager').data('sync-success')) {
        hideBusyIndicator();
        setStatusSuccess();
    }

    if($('#syncManager').data('sync-team')) {
        syncTeam();
    }
});

$(document).on('click', '.importButton', function(e){
    showBusyIndicator('Importing team...');
});

$(document).on('click', '#refreshButton', forceSyncTeam);
$(document).on('click', '#statusButton', forceSyncTeam);

$(document).on('click', '#setFavorite', setFavorite);

function syncTeam(force) {
    setStatusBusy();
    disableTradeButton();

    $.ajax({
        type: 'GET',
        url: '/leagues/' + $('#syncManager').data('league') + '/sync',
        data: { 
            force: force
        },
        success: handleSyncSuccess,
        error: handleSyncFailure,
    });
}

function forceSyncTeam() {
    startRefreshIcon();
    syncTeam(true);
}

function handleSyncSuccess(d) {
    hideBusyIndicator();
    stopRefreshIcon();
    enableTradeButton();
    
    if (d.status == 'update') {
        location.replace("?synced=true");
    } else if (d.status == 'no-update') {
        setStatusSuccess();
    }
}

function handleSyncFailure(d) {
    hideBusyIndicator();
    enableTradeButton();
    setStatusWarning();
}

function favNameFormatter(value, row, index) {
    if (value == $('#standingsTableData').data('my-team')) {
        return '<strong>' + value + '</strong>'
    } else {
        return value
    }
}

function enableTradeButton() {
    $('.tradeButton').removeClass('disabled')
    $('.tradeButton').prop('disabled', false);
}

function disableTradeButton() {
    $('.tradeButton').addClass('disabled')
    $('.tradeButton').prop('disabled', true);
}

function setStatusBusy() {
    elem = $('#statusButton');
    elem.html('<i class="fa fa-cog fa-spin fa-fw"></i> Syncing rosters...');
    setStatusButtonClass(elem, 'btn-info');
}

function setStatusSuccess() {
    elem = $('#statusButton');
    elem.html('<i class="fa fa-check-circle-o"></i> Synced!');
    setStatusButtonClass(elem, 'btn-success');
}

function setStatusWarning() {
    elem = $('#statusButton');
    elem.html('<i class="fa fa-warning"></i> Update failed. Try again later.');
    setStatusButtonClass(elem, 'btn-warning');
}

function setStatusButtonClass(elem, aClass) {
    btn_classes = ['btn-info', 'btn-success', 'btn-warning']

    for(var i = 0; i < btn_classes.length; i++) {
        if (btn_classes[i] == aClass) {
            elem.addClass(aClass);
        } else {
            elem.removeClass(btn_classes[i]);
        }
    }
}

function startRefreshIcon() {
    $('#refreshButton').children('i').addClass('fa-spin')
}

function stopRefreshIcon() {
    $('#refreshButton').children('i').removeClass('fa-spin')
}

function setFavorite() {
    $('#setFavorite').children('i').addClass('fa-heart')
    $('#setFavorite').children('i').removeClass('fa-heart-o')

    $.ajax({
        type: 'GET',
        url: '/leagues/' + $('#syncManager').data('league') + '/sync',
        data: { 
        },
        success: handleSyncSuccess,
        error: handleSyncFailure,
    });
}

