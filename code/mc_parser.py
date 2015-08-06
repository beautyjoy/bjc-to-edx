#! /usr/bin/env python3

from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import pdb
debug = pdb.set_trace
import io
import sys
import util

def make_quiz(source, destination=None):
    """
    Extracting from bjc file
    """

    filename = source.rsplit('/', 1)[1]
    try:
        soup = BeautifulSoup(open(source), "html.parser")
    except (OSError, IOError):
        if len(source) > 0:
            try:
                soup = BeautifulSoup(source, "html.parser")
            except:
                sys.exit(1)
        

    """
    make sure this is a multiple choice quiz
    """

    if soup.find("div", { "class" : "prompt" }) == None:
        sys.exit(1)

    for img in soup.find_all("img"):
        img["src"] = util.edx_image_location(img.get("src"))
        print(img)

    exclamation_point = soup.new_tag("em")
    exclamation_point.append("!")
    for snap in soup.find_all("span", {"class" : "snap"}):
        snap.replace_with("Snap")
        snap.append(exclamation_point)


    def content_string(tag):
        return "\n".join(str(s) for s in tag.contents).strip()

    prompt_text = content_string(soup.find("div", { "class" : "prompt" }))
    correct_answer_tag = soup.find("div", { "class" : "correctResponse" })
    correct_answer = content_string(soup.find(identifier=correct_answer_tag['identifier']).find("div", { "class" : "text" }))
    answer_list_unf = soup.findAll("div", { "class" : "text" })
    answer_list = []
    for a in answer_list_unf:
        answer_list.append(content_string(a))

    feedback_list_unf = soup.findAll("div", { "class" : "feedback" })
    full_explanation = str(content_string(feedback_list_unf[answer_list.index(correct_answer)]))
    feedback_list = []
    for f in feedback_list_unf:
        feedback_list.append("\n".join(f.stripped_strings))

    """
    Building xml output
    """

    def temp_html(i):
        return "--- HTML TEXT {} ---".format(i)

    index = -1
    def get_temp_html():
        nonlocal index
        index += 1
        return temp_html(index)

    def fill_html(s, l):
        for i in range(len(l)):
            s = s.replace(temp_html(i), l[i])
        return s

    html_fill_list = []

    problem = ET.Element("problem")
    problem.set("display_name", "Multiple Choice Problem");
    prompt = ET.SubElement(problem, "p")
    prompt.text = get_temp_html()
    html_fill_list.append(prompt_text)
    choices = ET.SubElement(ET.SubElement(problem, "multiplechoiceresponse"), "choicegroup",
                            type = "MultipleChoice")
    solution = ET.SubElement(ET.SubElement(problem, "solution"), "div",
                             attrib = {"class": "detailed-solution"})
    p1 = ET.SubElement(solution, "p")
    p1.text = "Explanation"
    p2 = ET.SubElement(solution, "p")
    p2.text = get_temp_html()
    html_fill_list.append(full_explanation)

    for answer in answer_list:
        if answer == correct_answer:
            choice = ET.SubElement(choices, "choice", correct = "true")
        else:
            choice = ET.SubElement(choices, "choice", correct = "false")
        choice.text = get_temp_html()
        html_fill_list.append(str(answer))
        feedback = ET.SubElement(choice, "choicehint")
        feedback.text = get_temp_html()
        html_fill_list.append(feedback_list[answer_list.index(answer)])

    tree = ET.ElementTree(problem)
    temp_string = io.BytesIO()
    tree.write(temp_string)
    output_string = fill_html(temp_string.getvalue().decode(), html_fill_list)
    ##################
    if destination:
        output_dest = destination + '/problem/' + filename[:-5] + ".xml"
        with open(output_dest, "w+") as output_file:
            output_file.write(output_string)
    else:
        sys.stdout.write(output_string)


if __name__ == '__main__':
    if sys.argv[1] == "-t":
        make_quiz('curriculum/bjc-r/cur/programming/intro/snap/test-yourself-go-team.html', 'Course')
    elif len(sys.argv) == 2:
        make_quiz(sys.argv[1])
    elif len(sys.argv) >= 3:
        make_quiz(sys.argv[1], sys.argv[2])





