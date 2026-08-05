# Zipdecode

## planning

All the below planning is some ideation I would do before writing c code for it

```c
#define ZIP_CODE_MAX_LEN 4
#define MAX_SUBURB_LEN 50
#define MAX_STATE_LEN 3

#define ZIP_DIGIT_TERMINATOR -1
typedef char zip_digit;

typedef enum {
    ZIP_TYPE_SPECIFIER,
    ZIP_TYPE_CODE,
    ZIP_TYPE_INVALID,
} zip_type;

typedef struct {
    zip_type type;
    float lat, long;
    char suburb[MAX_SUBURB_LEN + 1];
    char state[MAX_STATE_LEN + 1];
} zip_code;

typedef struct {
    zip_code codes[10**(ZIP_CODE_MAX_LEN)];
} zip_list;

int load_zip_list_from_file(FILE *f, zip_list *out_list);
int render_from_zip_list(zip_list *list, zip_code *code, zip_digit specifier[ZIP_CODE_MAX_LEN]);
int parse_zip_digits(FILE *in_stream, zip_digit out_specifier[ZIP_CODE_MAX_LEN]);
int get_zip_code(zip_digit specifier[ZIP_CODE_MAX_LEN], zip_code *out_code);
bool zip_has_changed(zip_digit one[ZIP_CODE_MAX_LEN], zip_digit two[ZIP_CODE_MAX_LEN]);
```

## Main functions

High level overview of the rough things I would do.

```c
static zip_list *list = NULL;
static zip_digit current_zip_digits[ZIP_CODE_MAX_LEN];

void setup() {
    assert(list == NULL);
    FILE *zip_code_file = NULL;
    if ((zip_code_file = fopen("zip_code_file.csv", "r")) == NULL) {
        perror("error opening zip_code_file.csv");
        // handle error
    }
    if (load_zip_list_from_file(zip_code_file, list) == -1) {
        perror("error loading zip");
        fclose(zip_code_file);
        // handle error
    }

    // get an actual in stream or smth
    fclose(zip_code_file);
}

void draw() {
    zip_digit new_zip_digits[ZIP_CODE_MAX_LEN];

    if (parse_zip_digits(stdin, new_zip_digits) == -1) {
        return;
    }

    if (zip_has_changed(current_zip_digits, new_zip_digits) == false) {
        return;
    }

    current_zip_digits = new_zip_digits;

    
    zip_code *code = NULL;
    if (get_zip_code(current_zip_digits, code) == -1) {
        perror("error getting zip_code"); // this should only happen on like, no memory errors
        // handle error
    }

    if (render_from_zip_list(list, code, current_zip_digits) == -1) {
        perror("error rendering");
        // handle error
    }
}
```
