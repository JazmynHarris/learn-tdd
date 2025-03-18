import app from "../server";
import request from "supertest";
import Author from "../models/author";
import mongoose from "mongoose";
import BookInstance from "../models/bookinstance";

describe("Verify GET /authors", () => {

    const mockAuthors = [
        {
            name: "Paul, Walker",
            lifespan: "1920 - 1927"
        },
        {
            name: "James, Jones",
            lifespan: "1923 - 2000"
        },
        {
            name: "Smith, Jonah",
            lifespan: "2000 - 2012"
        },
        {
            name: "Harris, Jazmyn",
            lifespan: "2002 - 2025"
        }
    ];

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    it("should respond with list of author names and lifetimes sorted by family name", async () => {
        const expectedSortedAuthors = [...mockAuthors]
            .sort((a, b) => a.name.localeCompare(b.name));
        Author.getAllAuthors = jest.fn().mockImplementationOnce((sortOpts) => {
            if (sortOpts && sortOpts.family_name === 1) {
                return Promise.resolve(expectedSortedAuthors);
            }
            return Promise.resolve(mockAuthors);
        });
        const response = await request(app).get(`/authors`);
        expect(response.statusCode).toBe(200);
        expect(expectedSortedAuthors).toStrictEqual(response.body);
    });

    it("should respond with an empty list and message if authors is empty", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValue([]);
        const response = await request(app).get(`/authors`);
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe(`No authors found`);
    });

    it("should respond with 500 there is an error", async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(null);
        const response = await request(app).get(`/authors`);
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe(`No authors found`);
    });
});