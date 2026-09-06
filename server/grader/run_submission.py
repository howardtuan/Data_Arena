import ast
import contextlib
import io
import json
import math
import statistics
import tracemalloc
import traceback
import sys

import numpy as np
import pandas as pd


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
    "builtins",
    "importlib",
    "ctypes",
    "pickle",
    "marshal",
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
FORBIDDEN_ATTR_CALLS = {
    "read_csv", "read_excel", "read_json", "read_pickle", "read_parquet",
    "read_sql", "read_sql_query", "read_sql_table", "read_html", "read_hdf",
    "read_feather", "read_orc", "read_table", "read_fwf", "read_clipboard",
    "read_stata", "read_sas", "read_spss", "read_xml",
    "to_csv", "to_excel", "to_json", "to_pickle", "to_parquet", "to_sql",
    "to_hdf", "to_feather", "to_orc", "to_stata", "to_clipboard", "to_xml",
    "load", "loadtxt", "genfromtxt", "fromfile", "memmap",
    "save", "savetxt", "savez", "savez_compressed",
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
        if isinstance(node.func, ast.Attribute) and node.func.attr in FORBIDDEN_ATTR_CALLS:
            raise ValueError(f"不允許呼叫 {node.func.attr}()")
        self.generic_visit(node)


def to_jsonable(value):
    if isinstance(value, pd.DataFrame):
        return [to_jsonable(record) for record in value.to_dict(orient="records")]
    if isinstance(value, pd.Series):
        return to_jsonable(value.tolist())
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, dict):
        return {str(k): to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(v) for v in value]
    if hasattr(value, "tolist"):
        return to_jsonable(value.tolist())
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return round(value, 10)
    return value


def limit_stdout(value):
    if len(value) <= 20000:
        return value
    return value[:20000] + "\n...[stdout truncated]"


def main():
    try:
        import resource
        limit = 1024 * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (limit, limit))
    except Exception:
        pass

    payload = json.loads(sys.stdin.read())
    code = payload["code"]
    function_name = payload["functionName"]
    test_cases = payload["testCases"]

    tree = ast.parse(code, mode="exec")
    SafetyVisitor().visit(tree)

    namespace = {
        "math": math,
        "statistics": statistics,
        "np": np,
        "numpy": np,
        "pd": pd,
        "pandas": pd,
    }
    setup_stdout = io.StringIO()
    with contextlib.redirect_stdout(setup_stdout):
        exec(compile(tree, "<submission>", "exec"), namespace)
    target = namespace.get(function_name)
    if not callable(target):
        raise ValueError(f"找不到可呼叫函式 {function_name}()")

    results = []
    pending_setup_stdout = setup_stdout.getvalue()
    for test_case in test_cases:
        case_stdout = io.StringIO()
        peak = 0
        try:
            tracemalloc.start()
            with contextlib.redirect_stdout(case_stdout):
                result = target(*test_case["args"])
            peak = tracemalloc.get_traced_memory()[1]
            tracemalloc.stop()
            results.append(
                {
                    "id": test_case["id"],
                    "ok": True,
                    "result": to_jsonable(result),
                    "stdout": limit_stdout(pending_setup_stdout + case_stdout.getvalue()),
                    "peak_memory": peak,
                }
            )
        except Exception as exc:
            try:
                peak = tracemalloc.get_traced_memory()[1]
                tracemalloc.stop()
            except Exception:
                pass
            results.append(
                {
                    "id": test_case["id"],
                    "ok": False,
                    "error": f"{exc.__class__.__name__}: {exc}",
                    "stdout": limit_stdout(pending_setup_stdout + case_stdout.getvalue()),
                    "peak_memory": peak,
                }
            )
        pending_setup_stdout = ""

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
