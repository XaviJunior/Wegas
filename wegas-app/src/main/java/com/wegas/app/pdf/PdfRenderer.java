/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.app.pdf;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import javax.servlet.DispatcherType;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.xml.sax.InputSource;

/**
 *
 * @author maxence
 */
@WebFilter(filterName = "PdfRenderer", urlPatterns = {"/print.html"}, dispatcherTypes = {DispatcherType.REQUEST})
public class PdfRenderer implements Filter {

    private static final boolean debug = true;

    // The filter configuration object we are associated with.  If
    // this value is null, this filter instance is not currently
    // configured. 
    private FilterConfig filterConfig = null;
    private DocumentBuilder documentBuilder;

    @Override
    public void init(FilterConfig config) throws ServletException {
	try {
	    this.filterConfig = config;
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
	    documentBuilder = factory.newDocumentBuilder();
	} catch (ParserConfigurationException e) {
	    throw new ServletException(e);
	}
    }

    public PdfRenderer() {
    }

    /**
     *
     * @param request The servlet request we are processing
     * @param response The servlet response we are creating
     * @param chain The filter chain we are processing
     *
     * @exception IOException if an input/output error occurs
     * @exception ServletException if a servlet error occurs
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
	    FilterChain chain)
	    throws IOException, ServletException {

	if (debug) {
	    log("PdfRenderer:doFilter()");
	}

	Throwable problem = null;
	try {

	    HttpServletRequest req = (HttpServletRequest) request;
	    HttpServletResponse resp = (HttpServletResponse) response;

	    String renderType = req.getParameter("outputType");
	    req.setCharacterEncoding("ISO-8859-1");

	    if (renderType != null && renderType.equals("pdf")) {
		// specific type ? capture response 
		ContentCaptureServletResponse capContent = new ContentCaptureServletResponse(resp);

		chain.doFilter(req, capContent);
		/*
		 * convert xhtml from String to XML Document 
		 */
		StringReader contentReader = new StringReader(capContent.getContent());
		InputSource source = new InputSource(contentReader);
		Document xhtmlDocument = documentBuilder.parse(source);

		ITextRenderer renderer = new ITextRenderer();

		/* Using <base> tag breaks inner <a href="#*" /> behaviour
		 *NodeList elementsByTagName = xhtmlDocument.getElementsByTagName("base");
		 Node namedItem = elementsByTagName.item(0).getAttributes().getNamedItem("href");
		 String base = namedItem.getNodeValue();
		*/
		
		String baseUrl;
		baseUrl = req.getRequestURL().toString().replaceAll(req.getServletPath(), "/");

		renderer.setDocument(xhtmlDocument, baseUrl);
		renderer.layout();

		resp.setContentType("application/pdf");
		OutputStream browserStream = resp.getOutputStream();

		renderer.createPDF(browserStream);
	    } else {
		// no specific type ? -> normal processing

		log("PdfRenderer:Normal output");
		chain.doFilter(request, response);
	    }
	} catch (Throwable t) {
	    // If an exception is thrown somewhere down the filter chain,
	    // we still want to execute our after processing, and then
	    // rethrow the problem after that.
	    problem = t;
	    t.printStackTrace();

	    log("ERROR");

	}

	// If there was a problem, we want to rethrow it if it is
	// a known type, otherwise log it.
	if (problem != null) {
	    if (problem instanceof ServletException) {
		throw (ServletException) problem;
	    }
	    if (problem instanceof IOException) {
		throw (IOException) problem;
	    }
	    sendProcessingError(problem, response);
	}
    }

    /**
     * Return the filter configuration object for this filter.
     *
     * @return
     */
    public FilterConfig getFilterConfig() {
	return (this.filterConfig);
    }

    /**
     * Set the filter configuration object for this filter.
     *
     * @param filterConfig The filter configuration object
     */
    public void setFilterConfig(FilterConfig filterConfig) {
	this.filterConfig = filterConfig;
    }

    /**
     * Destroy method for this filter
     */
    @Override
    public void destroy() {
    }

    /**
     * Return a String representation of this object.
     *
     * @return
     */
    @Override
    public String toString() {
	if (filterConfig == null) {
	    return ("PdfRenderer()");
	}
	StringBuffer sb = new StringBuffer("PdfRenderer(");
	sb.append(filterConfig);
	sb.append(")");
	return (sb.toString());
    }

    private void sendProcessingError(Throwable t, ServletResponse response) {
	String stackTrace = getStackTrace(t);

	if (stackTrace != null && !stackTrace.equals("")) {
	    try {
		response.setContentType("text/html");
		PrintStream ps = new PrintStream(response.getOutputStream());
		PrintWriter pw = new PrintWriter(ps);
		pw.print("<html>\n<head>\n<title>Error</title>\n</head>\n<body>\n"); //NOI18N

		// PENDING! Localize this for next official release
		pw.print("<h1>The resource did not process correctly</h1>\n<pre>\n");
		pw.print(stackTrace);
		pw.print("</pre></body>\n</html>"); //NOI18N
		pw.close();
		ps.close();
		response.getOutputStream().close();
	    } catch (Exception ex) {
	    }
	} else {
	    try {
		PrintStream ps = new PrintStream(response.getOutputStream());
		t.printStackTrace(ps);
		ps.close();
		response.getOutputStream().close();
	    } catch (Exception ex) {
	    }
	}
    }

    public static String getStackTrace(Throwable t) {
	String stackTrace = null;
	try {
	    StringWriter sw = new StringWriter();
	    PrintWriter pw = new PrintWriter(sw);
	    t.printStackTrace(pw);
	    pw.close();
	    sw.close();
	    stackTrace = sw.getBuffer().toString();
	} catch (Exception ex) {
	}
	return stackTrace;
    }

    public void log(String msg) {
	filterConfig.getServletContext().log(msg);
    }

}
