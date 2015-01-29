
min_font = 7
font_step = 1

min_width = 240.0
max_width = 852.0
width_step = 36.0

width = 0
font = 0

count = int((max_width - min_width) / width_step)
max_font = min_font + (count * font_step)

print('''html{font-size:20px}''')
print('''@media all and (min-width:{0:g}px){{html{{font-size:{1:g}px}}}}'''.format(max_width, max_font))

template = '''@media all and (max-width:{0:g}px){{html{{font-size:{1:g}px}}}}'''

print(template.format(max_width, max_font))
for i in xrange(count - 1, -1, -1):
    width = min_width + (i * width_step)
    font = min_font + (i * font_step)
    print(template.format(width, font))
