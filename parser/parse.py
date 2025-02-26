import pandas as pd
import json

FILE_NAME = 'lectures_2025-1'
INVALID_SCHOOLS = ['유형2', '-', '대학', '연계전공']


raw_lectures = pd.read_excel(f'{FILE_NAME}.xlsx')
schools = [school for school in raw_lectures['개설대학'].unique() if school not in INVALID_SCHOOLS]

lectures = dict()

for _, row in raw_lectures.iterrows():
    if row['학수번호'] not in lectures:
        if row['개설대학'] in INVALID_SCHOOLS:
            school = '기타'
        else:
            school = row['개설대학']

        lectures[row['학수번호']] = {
            'id': row['학수번호'],
            'school': school,
            'name': row['교과목명'],
        }
    else:
        if lectures[row['학수번호']]['school'] == '기타':
            if row['개설대학'] not in INVALID_SCHOOLS:
                lectures[row['학수번호']]['school'] = row['개설대학']
    

result = [x for x in lectures.values()]


with open(f'{FILE_NAME}.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False)




