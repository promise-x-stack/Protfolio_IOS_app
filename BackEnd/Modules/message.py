import json

class Message():

    def __init__ (self, file):
        self.file=file

    def file_r(self):
        with open(self.file,"r") as f:
            json_data = json.load(f)
            f.close()
            return json_data
 
if __name__ == "__main__":
    file_path = Message()
    data = file_path.file_r()
    print(data)
#.json\masege.json
