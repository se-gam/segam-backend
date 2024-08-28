import json

import openpyxl

data = openpyxl.load_workbook('lectures.xlsx')
sheet = data.active

first = True
result = []
for x in sheet.iter_rows():
    if first:
        first = False
        continue
    course_id = x[3].value+'-'+x[4].value
    school = x[1].value
    name = x[5].value
    result.append({
        'id': course_id,
        'school': school,
        'name': name
    })

with open('lectures.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=4)