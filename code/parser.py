### Comprehensive lab parser ###
from lab_parser import *
from reading_parser import *
from tar_file import *
import shutil, os, argparse

def stage_files(path, args, lst):
    # path = "curriculum/bjc-r/topic/berkeley_bjc/"
    found = False
    if args == "":
        for folder in os.listdir(path):
            if "." not in folder:
                for f in os.listdir(path + "/" + folder):
                    if ".topic" in f:
                        lst.append(path + folder + "/" + f)
    else:
        for f in args:
            if ".topic" in f:
                for folder in os.listdir(path):
                    if ".topic" not in folder:
                        if f in os.listdir(path + folder):
                            found = True
                            lst.append(path + folder + "/" + f)
                if not found:
                    print("---file '" + f + "' not found.")
                    print("Closing program...")
                    sys.exit()
            else:
                if f in os.listdir(path):
                    for filename in os.listdir(path + f):
                        lst.append(path + f + "/" + filename)
                else:
                    print("---directory '" + f + "' not found.")
                    sys.exit(1)
    return lst


def stage_course(destination):
    dir_contents = os.listdir(destination)
    if 'course.xml' not in dir_contents:
        with open(destination + '/course.xml', 'w') as f:
            f.write('<course url_name="2014_2" org="BJC" course="BJC_Course_Building_Test"/>')
    if 'about' not in dir_contents:
        os.mkdir(destination + '/about')
        prepare_file('effort.html', destination + '/about/')
        prepare_file('overview.html', destination + '/about/')
        prepare_file('short_description.html', destination + '/about/')
    if 'assets' not in dir_contents:
        os.mkdir(destination + '/assets')
        with open(destination + '/assets/assets.xml', 'w') as f:
            f.write('<assets/>')
    if 'chapter' not in dir_contents:
        os.mkdir(destination + '/chapter')

        for i in range(1, 16):
            with open(destination + '/chapter/Week' + str(i) + '.xml', 'w') as f:
                f.write('<chapter display_name="Week ' + str(i) + '">\n')

    if 'course' not in dir_contents:
        os.mkdir(destination + '/course')
        shutil.copyfile('defaultsettings.xml', prepare_file(destination + '.xml', destination + '/course/'))
    if 'html' not in dir_contents:
        os.mkdir(destination + '/html')
    if 'info' not in dir_contents:
        os.mkdir(destination + '/info')
        prepare_file('handouts.html', destination + '/info/')
        prepare_file('updates.html', destination + '/info/')
        prepare_file('updates.items.json', destination + '/info/')
    if 'problem' not in dir_contents:
        os.mkdir(destination + '/problem')
    if 'static' not in dir_contents:
        os.mkdir(destination + '/static')
    if 'sequential' not in dir_contents:
        os.mkdir(destination + '/sequential')
    if 'tabs' not in dir_contents:
        os.mkdir(destination + '/tabs')
    if 'vertical' not in dir_contents:
        os.mkdir(destination + '/vertical')


def llab_to_edx(source, destination, files):
    stage_course(destination)
    convert_readings(destination)
    for f in files:
        psuedo_topic = f.rsplit('/', 1)[1]
        print("Adding lab " + psuedo_topic + "...")
        prepare_file(psuedo_topic, destination)
        shutil.copy(f, psuedo_topic)
        convert_lab(psuedo_topic, destination)
        os.remove(destination + "/" + psuedo_topic)
        os.remove(psuedo_topic) #figure out why this is being created in the first place
        print("Parsed lab " + psuedo_topic + '.\n')

    place_labs(destination)
    for i in range(1, 16):
        with open(destination + '/chapter/Week' + str(i) + '.xml', 'a') as f:
                f.write('</chapter>')

    print("Creating new .tar.gz file for import...")
    tarred_file = destination + ".tar.gz"
    if os.path.exists(tarred_file):
        os.remove(tarred_file)


    print("Course file ready for import.")





def main():
    """
    Parses command line arguments and runs the script appropriately.
    If nothing is passed in, the default values are used.
    """
    parser = argparse.ArgumentParser(
            description="Translates content from HTML source to edX compatible one based on XML.")
    parser.add_argument("-S", "--source",
            type=str,
            default="curriculum/bjc-r",
            help="name of source folder")
    parser.add_argument("-O", "--destination", type=str, default="2014_2",
            help="name of the destination folder")
    parser.add_argument("-F", "--file", type=str, nargs='+', default="",
            help="files to parse")
    args = parser.parse_args()


    if not os.path.exists(args.source):
        print("Source folder {} not found in current directory.".format(args.source))
        print("Exiting.")
        sys.exit(1)
    if not os.path.exists(args.destination):
        os.mkdir(args.destination)
        print("Creating Output Folder: %s" % args.destination)


    files = []
    stage_files(source, args.file, files)

    llab_to_edx(args.source, args.destination, files)



# begin execution if we are running this file directly
if __name__ == "__main__":
    main()
