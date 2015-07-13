#! /usr/bin/env python3

from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import pdb
debug = pdb.set_trace
import codecs

def make_quiz(source, destination):
    """
    Extracting from bjc file
    """

    filename = source.rsplit('/', 1)[1]
    test_path = source
    soup = BeautifulSoup(open(test_path))
    
    """
    make sure this is a multiple choice quiz
    """

    if soup.find("div", { "class" : "prompt" }) == None:
        return

    #prompt_text = soup.find("div", { "class" : "prompt" }).get_text()#.encode('utf-8', "ignore").strip()
    prompt_text = soup.find("div", { "class" : "prompt" }).prettify(formatter=None) #.encode("utf-8", "ignore")
    #debug()
    correct_answer_tag = soup.find("div", { "class" : "correctResponse" })
    correct_answer = ((soup.find(identifier=correct_answer_tag['identifier']).find("div", { "class" : "text" }).get_text()).encode('utf-8', "ignore")).strip()
    answer_list_unf = soup.findAll("div", { "class" : "text" })
    answer_list = []
    for a in answer_list_unf:
        answer_list.append(((a.get_text()).encode('utf-8', "ignore")).strip())

    feedback_list_unf = soup.findAll("div", { "class" : "feedback" })
    feedback_list = []
    for f in feedback_list_unf:
        feedback_list.append(((f.get_text()).encode('utf-8', "ignore")).strip())

    """
    Formatting for xml
    """

    problem = ET.Element("problem")
    prompt = ET.SubElement(problem, "p")
    prompt.text = prompt_text
    print(prompt.text)
    choices = ET.SubElement(ET.SubElement(problem, "multiplechoiceresponse"), "choicegroup",
                            type = "MultipleChoice")
    solution = ET.SubElement(ET.SubElement(problem, "solution"), "div",
                             attrib = {"class": "detailed-solution"})
    p1 = ET.SubElement(solution, "p")
    p1.text = "Explanation"
    p2 = ET.SubElement(solution, "p")
    p2.text = str(feedback_list[answer_list.index(correct_answer)])
    
    for answer in answer_list:
        if answer == correct_answer:
            choice = ET.SubElement(choices, "choice", correct = "true")
            choice.text = str(answer)
        else:
            choice = ET.SubElement(choices, "choice", correct = "false")
            choice.text = str(answer)


    ##################
    output = destination + '/problem/' + filename[:-5] + ".xml"
    xml_file = output
    # print(output)
    #with open(output, 'w+') as xml_file:
    #    xml_file.write(xml_out)
    tree = ET.ElementTree(problem)
    ET.dump(tree)
    tree.write(xml_file, method = "html")


make_quiz('curriculum/bjc-r/cur/programming/intro/snap/test-yourself-go-team.html', 'Course')




