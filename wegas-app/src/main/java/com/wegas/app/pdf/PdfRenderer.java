/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.app.pdf;

import com.lowagie.text.DocumentException;
import com.sun.xml.bind.StringInputStream;
import com.wegas.core.Helper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.util.logging.Level;
import javax.servlet.DispatcherType;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.tidy.Tidy;
import org.w3c.tidy.ant.JTidyTask;
import org.xhtmlrenderer.pdf.ITextOutputDevice;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.xhtmlrenderer.pdf.ITextUserAgent;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 *
 * Filter that capture Servlet response and transform its content into PDF
 *
 * @author Maxence Laurent (maxence.laurent at gmail.com)
 */
@WebFilter(filterName = "PdfRenderer", urlPatterns = {"/print.html"}, dispatcherTypes = {DispatcherType.REQUEST})
public class PdfRenderer implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(PdfRenderer.class);

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
     * @param request  The servlet request we are processing
     * @param response The servlet response we are creating
     * @param chain    The filter chain we are processing
     *
     * @exception IOException      if an input/output error occurs
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
            if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
                HttpServletRequest req = (HttpServletRequest) request;
                HttpServletResponse resp = (HttpServletResponse) response;

                String renderType = req.getParameter("outputType");

                if (renderType != null && renderType.equals("pdf")) {
                    // specific type ? capture response 
                    ContentCaptureServletResponse capContent = new ContentCaptureServletResponse(resp);

                    chain.doFilter(req, capContent);
                    /*
                     * convert xhtml from String to XML Document 
                     */
                    String content = capContent.getContent();
                    Tidy tidy = new Tidy();
                    tidy.setXmlOut(true);

                    OutputStream os = new ByteArrayOutputStream();

                    tidy.parse(new StringInputStream(content), os);

                    StringReader contentReader = new StringReader(os.toString());
                    InputSource source = new InputSource(contentReader);

                    Document xhtmlDocument = documentBuilder.parse(source);

                    if (debug) {
                        Helper.logEnv();
                        Element utf8Test = xhtmlDocument.getElementById("testUTF8");
                        log("UTF-8 P test" + utf8Test.getTextContent());
                        log("Default charset: " + Charset.defaultCharset());
                    }

                    ITextRenderer renderer = new ITextRenderer();
                    CookieUserAgent userAgentCallback = new CookieUserAgent(renderer.getOutputDevice(), req.getCookies());
                    userAgentCallback.setSharedContext(renderer.getSharedContext());
                    renderer.getSharedContext().setUserAgentCallback(userAgentCallback);

                    final String baseUrl = req.getRequestURL().toString().replace(req.getServletPath(), "/");

                    renderer.setDocument(xhtmlDocument, baseUrl);

                    renderer.layout();

                    resp.setContentType("application/pdf; charset=UTF-8");
                    OutputStream browserStream = resp.getOutputStream();

                    renderer.createPDF(browserStream);
                    renderer.finishPDF();
                } else {
                    // no specific type ? -> normal processing

                    log("PdfRenderer:Normal output", null);
                    chain.doFilter(request, response);
                }
            } else {
                throw new ServletException("Not an HTTP request");
            }
        } catch (DocumentException | IOException | ServletException | DOMException | SAXException t) {
            problem = t;
            log("ERROR", t);
        }
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
        StringBuilder sb = new StringBuilder("PdfRenderer(");
        sb.append(filterConfig);
        sb.append(")");
        return (sb.toString());
    }

    private void sendProcessingError(Throwable t, ServletResponse response) {
        String stackTrace = getStackTrace(t);

        if (stackTrace != null && !stackTrace.equals("")) {
            try {
                response.setContentType("text/html");
                try (PrintStream ps = new PrintStream(response.getOutputStream()); PrintWriter pw = new PrintWriter(ps)) {
                    pw.print("<html>\n<head>\n<title>Error</title>\n</head>\n<body>\n"); //NOI18N

                    // PENDING! Localize this for next official release
                    pw.print("<h1>The resource did not process correctly</h1>\n<pre>\n");
                    pw.print(stackTrace);
                    pw.print("</pre></body>\n</html>"); //NOI18N
                }
                response.getOutputStream().close();
            } catch (IOException ex) {
            }
        } else {
            try {
                try (PrintStream ps = new PrintStream(response.getOutputStream())) {
                    t.printStackTrace(ps);
                }
                response.getOutputStream().close();
            } catch (IOException ex) {
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
        } catch (IOException ex) {
        }
        return stackTrace;
    }

    public void log(String msg) {
        log(msg, null);
    }

    public void log(String msg, Throwable t) {
        if (t != null) {
            logger.info(msg, t);
        } else {
            logger.info(msg);
        }
    }

    /**
     * UserAgentCallback with cookies.
     */
    private static class CookieUserAgent extends ITextUserAgent {

        private final Cookie[] cookies;

        public CookieUserAgent(ITextOutputDevice outputDevice, Cookie[] cookies) {
            super(outputDevice);
            this.cookies = cookies;
        }

        @Override
        protected InputStream resolveAndOpenStream(String uri) {
            java.io.InputStream is = null;
            try {
                URL url = new URL(uri);
                URLConnection uc = url.openConnection();
                uc.setRequestProperty("Cookie", joinCookies(this.cookies));
                is = uc.getInputStream();

            } catch (MalformedURLException ex) {
                java.util.logging.Logger.getLogger(PdfRenderer.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IOException ex) {
                java.util.logging.Logger.getLogger(PdfRenderer.class.getName()).log(Level.SEVERE, null, ex);
            }
            return is;
        }

        /**
         * Make a Cookie string
         *
         * @param cookies
         * @return
         */
        private static String joinCookies(Cookie[] cookies) {
            final String token = "; ";
            if (cookies.length == 0) {
                return "";
            }
            StringBuilder sb = new StringBuilder();
            sb.append(cookies[0].getName()).append("=").append(cookies[0].getValue());
            int i;
            for (i = 1; i < cookies.length; i++) {
                sb.append(token).append(cookies[i].getName()).append("=").append(cookies[i].getValue());
            }
            return sb.toString();
        }

    }
}
