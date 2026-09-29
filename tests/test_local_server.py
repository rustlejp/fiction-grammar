import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import local_server


class LocalServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = local_server.LocalServer(("127.0.0.1", 0), local_server.LocalHandler)
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"
        cls.worker = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.worker.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.worker.join(timeout=2)

    def test_serves_pages_and_health(self):
        with urlopen(self.base + "/docs/", timeout=2) as response:
            self.assertEqual(response.status, 200)
        with urlopen(self.base + "/local-editor/", timeout=2) as response:
            self.assertEqual(response.status, 200)
        with patch.object(local_server, "BASE_URL", self.base):
            self.assertTrue(local_server.already_running())

    def test_blocks_local_data_and_git_history(self):
        for path in ("/local-data/workspace-initial.json", "/.git/config", "/docs/../local-data/workspace-initial.json"):
            with self.subTest(path=path), self.assertRaises(HTTPError) as error:
                urlopen(self.base + path, timeout=2)
            self.assertEqual(error.exception.code, 404)

    def test_head_for_public_files(self):
        request = Request(self.base + "/docs/data/entries.json", method="HEAD")
        with urlopen(request, timeout=2) as response:
            self.assertEqual(response.status, 200)


if __name__ == "__main__":
    unittest.main()
