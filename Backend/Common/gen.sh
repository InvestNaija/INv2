#!/bin/bash
# USAGE: gen.sh PATH(s)
# PATH: project path which contains a proto directory and
#   a .proto named after the project (eg: blog, blog.proto)
#   and optionally some other .proto files

argc=$#
argv=("$@")

for (( j = 0; j < argc; ++j )); do
  echo "Generate gRPC and Protobuf code for ${PROJECT}/${PROJECT}.proto (eg: greet/greet.proto)."
  ./node_modules/.bin/grpc_tools_node_protoc -I ${argv[j]}/proto/                                   \
    --js_out=import_style=commonjs:${argv[j]}/proto/                            \
    --grpc_out=grpc_js:${argv[j]}/proto/                                        \
     $(find ${argv[j]}/proto/ -type f -name "*.proto" -not -path "${argv[j]}/proto/${argv[j]}.proto");

  echo "Generate only Protobuf code for all the other .proto files (if any) (eg: calculator/sum.proto)."
  ./node_modules/.bin/grpc_tools_node_protoc -I ${argv[j]}/proto/                                   \
    --js_out=import_style=commonjs:${argv[j]}/proto/                            \
    $(find ${argv[j]}/proto/ -type f -name "*.proto" -not -path "${argv[j]}/proto/${argv[j]}.proto")
  
  # Generate TypeScript definitions (optional)
  echo "Generating TypeScript interfaces (ts-proto) into ${INTERFACES_DIR}..."
  ./node_modules/.bin/grpc_tools_node_protoc -I ${argv[j]}/proto/                                   \
    --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts_proto                                   \
    --ts_proto_out=${argv[j]}/interfaces/                                   \
    $(find ${argv[j]}/proto/ -type f -name "*.proto" -not -path "${argv[j]}/proto/${argv[j]}.proto")
done
# set -euo pipefail

# if [ "$#" -lt 1 ]; then
#   echo "Usage: $0 PATH [...]  # PATH is a project dir that contains a proto/ folder"
#   exit 1
# fi

# GRPC_TOOLS="./node_modules/.bin/grpc_tools_node_protoc"
# TS_PROTO_PLUGIN="./node_modules/.bin/protoc-gen-ts_proto"

# for PROJECT_DIR in "$@"; do
#   PROTO_DIR="${PROJECT_DIR}/proto"
#   INTERFACES_DIR="${PROJECT_DIR}/interfaces"

#   if [ ! -d "${PROTO_DIR}" ]; then
#     echo "No proto dir at ${PROTO_DIR}, skipping." >&2
#     continue
#   fi

#   mkdir -p "${INTERFACES_DIR}"

#   # collect proto files (portable: works on macOS bash)
#   PROTO_FILES=()
#   while IFS= read -r -d '' file; do
#     PROTO_FILES+=("$file")
#   done < <(find "${PROTO_DIR}" -type f -name "*.proto" -print0)

#   if [ "${#PROTO_FILES[@]}" -eq 0 ]; then
#     echo "No .proto files found in ${PROTO_DIR}, skipping." >&2
#     continue
#   fi

#   echo "Generating TypeScript interfaces (ts-proto) into ${INTERFACES_DIR}..."
#   "${GRPC_TOOLS}" -I "${PROTO_DIR}" \
#     --plugin=protoc-gen-ts="${TS_PROTO_PLUGIN}" \
#     --ts_proto_out="${INTERFACES_DIR}" \
#     --ts_proto_opt="outputServices=grpc-js,\
# esModuleInterop=true,\
# forceLong=string,\
# useExactTypes=true,\
# outputClientImpl=true,\
# exportCommonSymbols=true,\
# outputTypeRegistry=true" \
#     "${PROTO_FILES[@]}"

#   echo "Done for ${PROJECT_DIR}"
# done