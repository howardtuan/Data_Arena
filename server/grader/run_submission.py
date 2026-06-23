import ast
import json
import math
import statistics
import traceback
import sys


FORBIDDEN_IMPORTS = {
    "os",
    "sys",
    "subprocess",
    "socket",
    "pathlib",
    "shutil",
    "multiprocessing",
    "threading",
    "requests",
    "urllib",
}
FORBIDDEN_CALLS = {
    "open",
    "eval",
    "exec",
    "compile",
    "__import__",
    "input",
    "breakpoint",
}


class SafetyVisitor(ast.NodeVisitor):
    def visit_Import(self, node):
        for alias in node.names:
            root = alias.name.split(".")[0]
            if root in FORBIDDEN_IMPORTS:
                raise ValueError(f"不允許 import {root}")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        root = (node.module or "").split(".")[0]
        if root in FORBIDDEN_IMPORTS:
            raise ValueError(f"不允許 import {root}")
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
            raise ValueError(f"不允許呼叫 {node.func.id}()")
        self.generic_visit(node)


def to_jsonable(value):
    if hasattr(value, "to_dict"):
        try:
            if value.__class__.__name__ == "DataFrame":
                return value.to_dict(orient="records")
            return value.to_dict()
        except TypeError:
            return value.to_dict()
    if hasattr(value, "tolist"):
        return value.tolist()
    if isinstance(value, dict):
        return {str(k): to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(v) for v in value]
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return round(value, 10)
    return value


def main():
    payload = json.loads(sys.stdin.read())
    code = payload["code"]
    function_name = payload["functionName"]
    test_cases = payload["testCases"]

    tree = ast.parse(code, mode="exec")
    SafetyVisitor().visit(tree)

    namespace = {
        "math": math,
        "statistics": statistics,
    }
    exec(compile(tree, "<submission>", "exec"), namespace)
    target = namespace.get(function_name)
    if not callable(target):
        raise ValueError(f"找不到可呼叫函式 {function_name}()")

    results = []
    for test_case in test_cases:
        try:
            result = target(*test_case["args"])
            results.append(
                {
                    "id": test_case["id"],
                    "ok": True,
                    "result": to_jsonable(result),
                }
            )
        except Exception as exc:
            results.append(
                {
                    "id": test_case["id"],
                    "ok": False,
                    "error": f"{exc.__class__.__name__}: {exc}",
                }
            )

    print(json.dumps({"ok": True, "results": results}, ensure_ascii=True))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": f"{exc.__class__.__name__}: {exc}",
                    "trace": traceback.format_exc(limit=2),
                },
                ensure_ascii=True,
            )
        )
