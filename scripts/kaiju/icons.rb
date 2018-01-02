require 'json'
require 'rails'

icons = %w[success successInverse available complete critical scheduled highPriority alert warning information informationInverse error doNotDisturb help helpInverse dueSoon overDue high low max min abnormal deviceCheck deviceAlert diamond pharmacyReject add search commit checkmark trash paperFolded printer comment bookmark modified first folder attachment send pill visualization lightbulb forward projects replyAll flag calculator caretRight caretLeft caretUp caretDown trophy chevronLeft previous chevronRight next chevronUp expandLess chevron chevronDown expandMore clock away sortAscending sortDescending treemap glasses image doorOpen ellipses exclamation italicI minus close clear notMet incomplete person left right up down settings edit calendar lookback refresh provider padlock featured featuredOutline archive funnel documents unknown house save hospital pending analytics announcement camera briefcase link list menu checklist unlock due spinner tile users knurling addPerson upload download cancel maximize minimize reply table required gapChecking personHospital personnelPerson leftPane flowsheet notification last device paperPencil clipboard zoomOut zoomIn envelope allergy phone panelLeft panelRight tag iPass scratchPad pharmacyReview busy unavailable implant protocol videoCamera noSignal reload recurringEvent separate merge]

icons.each do |icon|
  icon_name = icon.slice(0,1).capitalize + icon.slice(1..-1)
  file = JSON.parse(File.read('./template.json'))
  file['name'] = "Icon#{icon_name}"
  file['display'] = "#{icon_name.titleize} Icon"
  file['description'] = "#{icon_name} Icon"
  file['import_from'] = "terra-icon/lib/icon/Icon#{icon_name}"
  icon_file = File.new("../lib/kaiju/icons/Icon#{icon_name}.json",  "w+")
  icon_file.write(JSON.pretty_generate(file))
  puts icon_file
end
