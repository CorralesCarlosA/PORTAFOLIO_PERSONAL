import unittest
from main import Project


class ProjectSchemaImageUrlTest(unittest.TestCase):
    def test_project_schema_has_image_url_column(self):
        columns = [column.name for column in Project.__table__.columns]
        self.assertIn("image_url", columns)


if __name__ == "__main__":
    unittest.main()
