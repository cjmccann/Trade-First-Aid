# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
#
addEventListener 'turbolinks:load', ->
  $('[data-toggle="table"]').bootstrapTable()
  $('div#favStandings').height($('#favTeamContainer').height());
  return
