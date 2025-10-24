#!/bin/bash

# 1. Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo "Error: 'yq' is not installed."
    echo "This script requires yq to safely edit YAML frontmatter."
    echo "Please install it first. See: https://github.com/mikefarah/yq/#install"
    exit 1
fi

# 2. Ask the user for the tag
read -p "Enter the tag to add (e.g., 'new-project'): " tag_name

# 3. Validate the input
if [ -z "$tag_name" ]; then
    echo "Error: No tag provided. Exiting."
    exit 1
fi

# 4. Sanitize the tag: remove leading '#' and replace spaces with hyphens
tag_name=${tag_name##\#}
if [[ "$tag_name" == *" "* ]]; then
    echo "Info: Tag contains spaces. Converting to hyphenated-case."
    tag_name=$(echo "$tag_name" | tr ' ' '-')
    echo "Using tag: '$tag_name'"
fi

count=0
skipped=0

echo "------------------------------------------------"
echo "Searching for .md files to tag with '$tag_name'..."
echo "------------------------------------------------"

# 5. Find all .md files recursively and process them
find . -type f -name "*.md" -print0 | while IFS= read -r -d '' file; do
    
    # Check if the file starts with '---' (has frontmatter)
    if head -n 1 "$file" | grep -q -E "^---$"; then
        
        # Use yq to process *only* the frontmatter
        # '.tags += ["tag"]' will:
        #  - Create 'tags: ["tag"]' if 'tags' doesn't exist
        #  - Append "tag" to the 'tags' array if it does exist
        #  - Automatically handles uniqueness (won't add duplicates)
        yq e --front-matter=process ".tags += [\"$tag_name\"]" -i "$file"
        
        # Check if yq was successful
        if [ $? -eq 0 ]; then
            echo "Tagged: $file"
            ((count++))
        else
            echo "Error processing: $file (check file for issues)"
        fi
    else
        echo "Skipped (no frontmatter): $file"
        ((skipped++))
    fi
done

echo "------------------------------------------------"
echo "Done."
echo "Successfully tagged $count files."
echo "Skipped $skipped files (no frontmatter)."